import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();// загрузка переменных окружения из файла .env

const app = express();
const PORT = 3000;

app.get('/api/tickets', async (req, res) => {
  try {
    // Пример запроса к Travelpayouts API для получения цен на авиабилеты
    // 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates'
    const response = await axios.get(
      `${process.env.TRAVELPAYOUTS_API_URL}/aviasales/v3/prices_for_dates`,
      {
        headers: {
          'X-Access-Token': process.env.TRAVELPAYOUTS_API_KEY,
        },
        params: {
          origin: 'MAD',
          destination: 'BCN',
          departure_at: '2026-09',
          return_at: '2026-10',
          one_way: false,
          currency: 'usd',
          sorting: 'price',
          direct: false,
          unique: false,
          limit: 30,
          page: 1,
        },
      },
    );

    console.log('Travelpayouts response:', response.data);

    res.json(response.data);
  } catch (error) {
    console.error(
      'Travelpayouts error:',
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});