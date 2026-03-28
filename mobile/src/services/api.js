import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3000/api';

const getToken = async () => {
        return AsyncStorage.getItem('token');
};

export const setToken = async (token) => {
        return AsyncStorage.setItem('token', token);
};

export const removeToken = async () => {
        return AsyncStorage.removeItem('token');
};

const request = async (endpoint, options = {}) => {
        const token = await getToken();
        const headers = {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
        };

        const res = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers,
        });

        const data = await res.json();

        if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
        }

        return data;
};

export const api = {
        post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
        get: (endpoint) => request(endpoint, { method: 'GET' }),
};