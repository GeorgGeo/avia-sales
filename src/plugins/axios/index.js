import axios from 'axios';

const apiClient = axios.create({
  // baseURL: 'https://api.example.com', // Замените на ваш базовый URL
  // baseURL: import.meta.env.VITE_API_URL, // Используем переменную окружения для базового URL
  baseURL: '/api', // Используем прокси для запросов к API
  headers: {
    'Content-Type': 'application/json', // Устанавливаем заголовок Content-Type для JSON
    // 'X-Access-Token': import.meta.env.VITE_API_KEY, // Используем переменную окружения для API ключа
  },
});

export default apiClient;
