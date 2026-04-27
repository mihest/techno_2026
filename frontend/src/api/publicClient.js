import axios from 'axios';

const publicClient = axios.create({
    baseURL: 'https://mihest.ru/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default publicClient;