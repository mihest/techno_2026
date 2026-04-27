import publicClient from './publicClient.js';
import {setTokens, clearTokens, getAccessToken} from '../tokens/tokenManager.js';
import {api} from './client.js';

export async function login(username, password) {
    const response = await publicClient.post('/auth/SignIn', {username, password});
    const {access_token} = response.data;
    setTokens(access_token);
    return response.data;
}

export async function register(username, password, confirm_password) {
    const response = await publicClient.post('/auth/SignUp', {username, password, confirm_password});
    const {access_token} = response.data;
    setTokens(access_token);
    return response.data;
}

export async function refreshAccessToken() {
    const response = await publicClient.post('/auth/Refresh', {});
    const {access_token} = response.data;
    setTokens(access_token);
    return access_token;
}

export async function logout() {
    try {
        const token = getAccessToken();
        if (token) {
            await api.put('/auth/SignOut');
        }
    } catch (e) {
        console.error('Logout error', e);
    } finally {
        clearTokens();
        window.location.href = '/login';
    }
}