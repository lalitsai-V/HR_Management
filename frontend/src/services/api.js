import axios from 'axios';

let envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Remove trailing slash
envApiUrl = envApiUrl.replace(/\/$/, '');

// If it's a production URL (doesn't contain localhost) and doesn't end with /api, append it.
if (!envApiUrl.includes('localhost') && !envApiUrl.endsWith('/api')) {
  envApiUrl += '/api';
}

const API_URL = envApiUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;