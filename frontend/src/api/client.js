// api.js
import axios from 'axios';
import {getAccessToken, setTokens} from '../tokens/tokenManager.js';
import {refreshAccessToken} from './auth.js';

// Создаём экземпляр axios с базовыми настройками
const apiClient = axios.create({
    baseURL: 'https://mihest.ru/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Флаги и очередь для обновления токена
let isRefreshing = false;
let refreshSubscribers = [];

// Функция, вызываемая после получения нового токена
function onRefreshed(newToken) {
    refreshSubscribers.forEach(cb => cb(newToken));
    refreshSubscribers = [];
}

// Добавляем callback в очередь
function addRefreshSubscriber(cb) {
    refreshSubscribers.push(cb);
}

// Перехватчик запроса: добавляем Bearer токен, если он есть
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Перехватчик ответа: обработка 401 и обновление токена
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // Если не 401 – отклоняем
        if (status !== 401) {
            return Promise.reject(error);
        }

        // Если запрос уже повторялся – не пытаемся снова
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        // Если нет токена – не обновляем, просто отклоняем (логин не требуется)
        if (!getAccessToken()) {
            return Promise.reject(error);
        }

        // Если уже идёт процесс обновления – ставим запрос в очередь
        if (isRefreshing) {
            return new Promise((resolve) => {
                addRefreshSubscriber((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(apiClient(originalRequest));
                });
            });
        }

        // Начинаем обновление
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Вызываем функцию обновления токена (она должна обновить tokenManager)
            await refreshAccessToken();
            const newToken = getAccessToken();
            if (!newToken) {
                throw new Error('Token not set after refresh');
            }

            // Уведомляем очередь о новом токене
            onRefreshed(newToken);
            isRefreshing = false;

            // Повторяем исходный запрос
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            // Очищаем токен и перенаправляем на логин
            setTokens(null);
            isRefreshing = false;
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
    }
);

// Экспортируем готовый объект с методами
export const api = {
    get: (url, config) => apiClient.get(url, config),
    post: (url, data, config) => apiClient.post(url, data, config),
    put: (url, data, config) => apiClient.put(url, data, config),
    delete: (url, config) => apiClient.delete(url, config),
};

// Экспортируем сам инстанс на случай, если понадобится прямая работа
export default apiClient;