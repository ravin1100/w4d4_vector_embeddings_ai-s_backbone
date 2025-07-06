import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create an authenticated API instance for admin endpoints
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a public API instance for user endpoints
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth header only to admin API instance
adminApi.interceptors.request.use((config) => {
  const auth = localStorage.getItem('auth');
  if (auth) {
    config.headers.Authorization = `Basic ${auth}`;
  }
  return config;
});

export const uploadFile = async (file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);

  return adminApi.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

export const askQuestion = async (question: string) => {
  return publicApi.post('/qa', { question });
};

export { adminApi, publicApi }; 