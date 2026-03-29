import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'dotell_token';

const getToken = async () => {
        if (Platform.OS === 'web') {
                return localStorage.getItem(TOKEN_KEY);
        }
        return SecureStore.getItemAsync(TOKEN_KEY);
};

export const setToken = async (token) => {
        if (Platform.OS === 'web') {
                localStorage.setItem(TOKEN_KEY, token);
                return;
        }
        return SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const removeToken = async () => {
        if (Platform.OS === 'web') {
                localStorage.removeItem(TOKEN_KEY);
                return;
        }
        return SecureStore.deleteItemAsync(TOKEN_KEY);
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
        patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
};