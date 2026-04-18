import axios from 'axios';

console.log("Variáveis de ambiente:", import.meta.env);

const baseURL = import.meta.env?.PUBLIC_API_URL || import.meta.env?.VITE_API_URL || 'https://core-nlp-support.onrender.com';

export const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@CRM:token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});