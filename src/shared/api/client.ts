import axios from 'axios';
import { API_CONFIG } from './config';

export const firebaseClient = axios.create({
    baseURL: API_CONFIG.FIREBASE_BASE_URL,
    timeout: API_CONFIG.TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
});

export const mockClient = axios.create({
    baseURL: API_CONFIG.MOCK_BASE_URL,
    timeout: API_CONFIG.TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
});
