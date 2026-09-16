import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();// загрузка переменных окружения из файла .env

const app = express();
const PORT = 3000;

app.get('/api/tickets', async (req, res) => {
  try {
    console.log('Tickets request from frontend:', req.query);
    // Пример запроса к Travelpayouts API для получения цен на авиабилеты
    // 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates'
    const response = await axios.get(
      `${process.env.TRAVELPAYOUTS_API_URL}/aviasales/v3/prices_for_dates`,
      {
        headers: {
          'X-Access-Token': process.env.TRAVELPAYOUTS_API_KEY,
        },
        // проверка ответа
        // params: {
        //   origin: 'MAD',
        //   destination: 'BCN',
        //   departure_at: '2026-09',
        //   return_at: '2026-10',
        //   one_way: false,
        //   currency: 'usd',
        //   sorting: 'price',
        //   direct: false,
        //   unique: false,
        //   limit: 30,
        //   page: 1,
        // },
        params: {
          origin: req.query.origin,
          destination: req.query.destination,
          departure_at: req.query.departure_at,
          return_at: req.query.return_at,
          one_way: req.query.one_way,
          currency: req.query.currency,
          sorting: req.query.sorting,
          direct: req.query.direct,
          unique: req.query.unique,
          limit: req.query.limit,
          page: req.query.page,
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

// Ниже существующего /api/tickets добавим новый маршрут
app.get('/api/nearby-dates', async (req, res) => {
  try {
    const {
      origin,
      destination,
      depart_date,
      return_date,
      currency = 'usd',
    } = req.query;

    if (!origin || !destination || !depart_date || !return_date) {
      return res.status(400).json({
        success: false,
        error: 'origin, destination, depart_date and return_date are required',
      });
    }

    const response = await axios.get(
      `${process.env.TRAVELPAYOUTS_API_URL}/v2/prices/week-matrix`,
      {
        headers: {
          'X-Access-Token': process.env.TRAVELPAYOUTS_API_KEY,
        },

        params: {
          origin,
          destination,
          depart_date,
          return_date,
          currency,
          show_to_affiliates: true,
        },
      }
    );
    // nearbyDates данные из API получаем в виде массива объектов и сортируем  их по цене
    const nearbyDates = Array.isArray(response.data?.data)
      ? response.data.data
          .filter(item => item.actual !== false)
          .map(item => ({
            departDate: item.depart_date,
            returnDate: item.return_date || null,
            price: item.value,
            stops: item.number_of_changes ?? 0,
            currency: response.data.currency || currency,
          }))
          .sort((a, b) => Number(a.price) - Number(b.price))
      : [];

    // res.json(response.data);
    // Возвращаем ответ в виде объекта с данными и сообщением об ошибке
    return res.json({
      success: response.data?.success ?? true,
      data: nearbyDates,
      error: response.data?.error ?? null,
    });

  } catch (error) {
    console.error(
      'Nearby dates error:',
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      error: 'Failed to load nearby dates',
    });
  }
});

// Следующий этап №1 — сделать autocomplete endpoint на Express
// Добавляем второй endpoint:
app.get('/api/airports', async (req, res) => {
  try {
    const response = await axios.get(
      'https://autocomplete.travelpayouts.com/places2',
      {
        params: {
          term: req.query.term,
          locale: 'en',
          'types[]': ['airport', 'city'],
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      'Autocomplete error:',
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
