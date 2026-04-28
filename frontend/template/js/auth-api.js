(function () {
    const TOKEN_STORAGE_KEY = 'imprezzio_auth';
    const API_BASE_URL = (
        window.AUTH_API_BASE_URL ||
        localStorage.getItem('apiBaseUrl') ||
        'https://mihest.ru/api'
    ).replace(/\/$/, '');

    const AGE_GROUP_IDS = {
        under14: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        '14-15': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        '15-16': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        '16-17': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        '18plus': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        ...(window.AUTH_AGE_GROUP_IDS || {}),
    };

    function getSession() {
        try {
            return JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || 'null');
        } catch {
            return null;
        }
    }

    function saveSession(authResponse) {
        if (!authResponse?.access_token) {
            throw new Error('Сервер не вернул access_token');
        }

        const session = {
            user: authResponse.user || null,
            accessToken: authResponse.access_token,
            tokenType: authResponse.token_type || 'Bearer',
        };

        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(session));
        localStorage.setItem('app_user', JSON.stringify(session.user));

        return session;
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem('app_user');
        document.cookie = 'refresh_token=; path=/; max-age=0; SameSite=Lax';
    }

    function getErrorMessage(errorData, fallback = 'Ошибка запроса') {
        const detail = errorData?.detail || errorData?.message;

        if (typeof detail === 'string') {
            return detail;
        }

        if (Array.isArray(detail)) {
            return detail
                .map((item) => {
                    if (typeof item === 'string') return item;
                    return item?.msg || item?.message || JSON.stringify(item);
                })
                .join('\n');
        }

        if (typeof errorData === 'string') {
            return errorData;
        }

        return fallback;
    }

    async function request(path, options = {}) {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method: options.method || 'GET',
            credentials: 'include',
            mode: 'cors',
            ...options,
            headers: {
                ...(options.body
                    ? {
                          'Content-Type': 'application/json',
                          Accept: 'application/json',
                      }
                    : {}),
                ...(options.headers || {}),
            },
        });

        let data = null;
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = text ? { detail: text } : null;
        }

        if (!response.ok) {
            throw new Error(getErrorMessage(data, `HTTP ${response.status}`));
        }

        return data;
    }

    function authHeaders() {
        const session = getSession();

        if (!session?.accessToken) {
            return {};
        }

        return {
            Authorization: `${session.tokenType || 'Bearer'} ${session.accessToken}`,
        };
    }

    async function signIn({ username, password }) {
        const data = await request('/auth/SignIn', {
            method: 'POST',
            body: JSON.stringify({
                username,
                password,
            }),
        });

        return saveSession(data);
    }

    async function signUp({ username, nickname, ageGroup, password, confirmPassword }) {
        const ageGroupId = AGE_GROUP_IDS[ageGroup] || ageGroup;

        const data = await request('/auth/SignUp', {
            method: 'POST',
            body: JSON.stringify({
                username,
                nickname,
                age_group_id: ageGroupId,
                password,
                confirm_password: confirmPassword,
            }),
        });

        return saveSession(data);
    }

    async function validate() {
        return request('/auth/Validate', {
            method: 'GET',
            headers: authHeaders(),
        });
    }

    async function signOut() {
        try {
            if (getSession()?.accessToken) {
                await request('/auth/SignOut', {
                    method: 'PUT',
                    headers: authHeaders(),
                });
            }
        } finally {
            clearSession();
        }
    }

    async function authorizedFetch(path, options = {}) {
        return request(path, {
            ...options,
            headers: {
                ...authHeaders(),
                ...(options.headers || {}),
            },
        });
    }

    window.AuthApi = {
        API_BASE_URL,
        AGE_GROUP_IDS,
        getSession,
        saveSession,
        clearSession,
        signIn,
        signUp,
        validate,
        signOut,
        authorizedFetch,
    };
})();