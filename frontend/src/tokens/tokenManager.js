import {api} from '../api/client.js';
import {refreshAccessToken} from '../api/auth.js';

const ACCESS_KEY = 'access_token';
let accessToken = null;

export function setTokens(access) {
    accessToken = access;
    if (access) {
        sessionStorage.setItem(ACCESS_KEY, access);
    } else {
        sessionStorage.removeItem(ACCESS_KEY);
    }
}

export function getAccessToken() {
    if (!accessToken) {
        const saved = sessionStorage.getItem(ACCESS_KEY);
        if (saved) accessToken = saved;
    }
    return accessToken;
}

export function isAuthenticated() {
    return !!getAccessToken();
}

export function clearTokens() {
    accessToken = null;
    sessionStorage.removeItem(ACCESS_KEY);
}

export async function validateToken() {
    const token = getAccessToken();

    if (!token) {
        console.log('validateToken: no access token');
        return false;
    }

    try {
        const response = await api.get('/auth/Validate');
        const data = response.data;

        if (data.status === 'success') {
            console.log('validateToken: token is valid');
            return true;
        }
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('validateToken: token expired, refreshing...');
            try {
                await refreshAccessToken();
                console.log('validateToken: token refreshed successfully');
                return true;
            } catch (refreshError) {
                console.error('validateToken: refresh failed', refreshError);
                clearTokens();
                return false;
            }
        } else {
            console.error('validateToken: unexpected error', error);
            return false;
        }
    }
}