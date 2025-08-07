import axios from 'axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig(); // Récupère le runtimeConfig

  const api = axios.create({
    baseURL: config.public.apiBaseUrl, // Utilise la valeur définie dans .env ou par défaut
  });

  // Intercepteur pour inclure le token si nécessaire
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return {
    provide: {
      api,
    },
  };
});
