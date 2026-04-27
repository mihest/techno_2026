import {login, logout, refreshAccessToken} from './api/auth.js';
import {getAccessToken, validateToken} from './tokens/tokenManager.js';

const init = async () => {
    try {
        await login('username', 'password');
        console.log('Logged in');

        console.log(getAccessToken());
        await validateToken();

        let response = await refreshAccessToken();
        console.log(response.json());

        await logout();

        await validateToken();
    } catch (err) {
        console.error('Auth error:', err.message);
    }
}

init()