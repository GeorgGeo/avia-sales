<script setup>
import { ref, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/plugins/axios';
// import M from '@/plugins/materialize'
// import * as Materialize from '@materializecss/materialize'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const store = useStore();

const bgImageLoaded = ref(false);
const bgImageUrl = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=2000&q=80';

// Значения, которые вводит пользователь
// Значения input
const departureInput = ref(''); // что показывает input: Madrid (MAD)
const destinationInput = ref('');

// Коды для API
const departureCode = ref(''); // что реально отправляется API: MAD
const destinationCode = ref('');

// Результаты autocomplete
const departureResults = ref([]); // Создаём результаты autocomplete
const destinationResults = ref([]); // Создаём результаты autocomplete

// Состояние загрузки
const departureLoading = ref(false);// Добавляем состояние загрузки
const destinationLoading = ref(false);// Добавляем состояние загрузки

// Флаг выбора результата
const isSelectingDeparture = ref(false); // Добавляем состояние выбора аэропорта, добавляем специальный флаг, для отслеживания изменения departureInput в watch. Это нужно, чтобы не сбрасывать departureCode при выборе аэропорта из списка.
const isSelectingDestination = ref(false);

// Ссылки на DOM-элементы для Materialize Autocomplete
const departureInputEl = ref(null); // From where
const destinationInputEl = ref(null); // Where to? 
// const departInput = ref(null);
// const returnInput = ref(null);

const departDate = ref(null);
const returnDate = ref(null);

// Пребразовываем дату под формат YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Добавляем функцию запроса аэропортов
const searchAirports = async (term) => {
  const searchTerm = term.trim();

  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  try {
    const response = await apiClient.get('/airports', {
      params: {
        term: searchTerm,
      },
    });

    console.log('Airports response:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error fetching airports:', error);

    return [];
  }
};
// Делаем autocomplete для Departure
watch(departureInput, async (value) => {
  // Если значение изменилось в результате выбора аэропорта,
  // новый запрос к API делать не нужно
  if (isSelectingDeparture.value) {
    isSelectingDeparture.value = false; // Сбрасываем флаг после выбора
    return;
  }

  // Пользователь начал вводить новое значение —
  // старый выбранный код больше недействителен
  departureCode.value = '';

  if (!value || value.length < 2) {
    departureResults.value = [];
    return;
  };

  departureLoading.value = true;
  departureResults.value = await searchAirports(value);
  departureLoading.value = false;
});

// Делаем autocomplete для Destination
watch(destinationInput, async (value) => {

  if (isSelectingDestination.value) {
    isSelectingDestination.value = false;
    return;
  }

  destinationCode.value = ''; // если пользователь начал вводить новое значение - старый выбранный код больше недействителен

  if (!value || value.length < 2) {
    destinationResults.value = [];
    return;
  };

  destinationLoading.value = true;
  destinationResults.value = await searchAirports(value);
  destinationLoading.value = false;
})

// Функция поиска билетов
const searchFlight = () => {
  // Проверка, если пользовательничего не выбрал из autocomplete, то код будет пустой, и мы не будем отправлять запрос
  if (!departureCode.value || !destinationCode.value) {
    alert('Please select both departure and destination airports from the list.');
    return;
  };
  // Проверка, если пользователь не выбрал даты, то мы не будем отправлять запрос
  if (!departDate.value || !returnDate.value) {
    alert('Please select both departure and return dates.');
    return;
  };
  const params = {
    // origin: departureInput.value,
    // destination: destinationInput.value,
    origin: departureCode.value,
    destination: destinationCode.value,
    departure_at: formatDate(departDate.value),
    return_at: formatDate(returnDate.value),
    one_way: false,
    currency: 'usd',
    sorting: 'price',
    direct: false,
    unique: false,
    limit: 30,
    page: 1,
  };

  store.dispatch('tickets/fetchTickets', params);
}
//! Самое важное — выбор результата
const selectDeparture = (airport) => {
  // Сообщаем watch(), что сейчас значение input
  // изменяется программно в результате выбора
  isSelectingDeparture.value = true;

  // Показываем пользователю название + код
  departureInput.value = `${airport.name} (${airport.code})`; // Показываем в input
  

  // Сохраняем код для API
  departureCode.value = airport.code; // Сохраняем код для отправки на сервер
  // Закрываем список
  departureResults.value = []; // Очищаем результаты, чтобы скрыть список

  console.log('Selected departure:', airport); // Для отладки, показываем выбранный аэропорт в консоли
  console.log('Departure input:', departureInput.value); // Для отладки, показываем значение input
  console.log('Departure code:', departureCode.value); // Для отладки, показываем код аэропорта
}
//! Самое важное — выбор результата
const selectDestination = (airport) => {
  // Сообщаем watch(), что input изменяется
  // программно в результате выбора
  isSelectingDestination.value = true;

  // Показываем пользователю название + код
  destinationInput.value = `${airport.name} (${airport.code})`;

  // Сохраняем код для API
  destinationCode.value = airport.code;

  // Закрываем список
  destinationResults.value = [];

  console.log('Selected destination:', airport);
  console.log('Destination input:', destinationInput.value);
  console.log('Destination code:', destinationCode.value);
}
// Сделаем тестовые данные, чтобы убедиться, что сам компонент работает(Autocomplite)
// const airports = [
//   { id: 'MAD', text: 'Madrid (MAD)' },
//   { id: 'BCN', text: 'Barcelona (BCN)' },
//   { id: 'LHR', text: 'London (LHR)' },
//   { id: 'CDG', text: 'Paris (CDG)' },
//   { id: 'FCO', text: 'Rome (FCO)' },
//   { id: 'BER', text: 'Berlin (BER)' },
// ];

// let departureAutocomplete
// let destinationAutocomplete

// let departDatepicker
// let returnDatepicker

onMounted(async () => {
  // Сначала просто проверяем API из Vue, Пока не подключаем Materialize.
  // Это был тест, чтобы убедиться, что Vue умеет обращаться к твоему Express endpoint.
  // const airports = await searchAirports('lon');
  // console.log('Airports from Vue:', airports);
  // =========================
  // Background image
  // =========================
  // Пробуем загрузить изображение через JavaScript
  const img = new Image();
  img.src = bgImageUrl;

  img.onload = () => {
    // Изображение загрузилось успешно
    bgImageLoaded.value = true;
  };

  img.onerror = () => {
    // Ошибка загрузки - оставляем false (покажет градиент)
    bgImageLoaded.value = false;
    console.warn('Background image failed to load, using fallback gradient');
  };

  // =========================
  // Autocomplete
  // =========================

  // Materialize теперь инициализируем так:
  // Инициализируем Autocomplete
  // const autocompleteOptions = {
  //   minLength: 1,
  //   data: airports,
  // };

  // departureAutocomplete = Materialize.Autocomplete.init(
  //   departureInputEl.value,
  //   // autocompleteOptions
  // );

  // destinationAutocomplete = Materialize.Autocomplete.init(
  //   destinationInputEl.value,
  //   // autocompleteOptions
  // );

  // =========================
  // Datepicker
  // =========================

});

// onBeforeUnmount(() => {
//   departureAutocomplete?.destroy()
//   destinationAutocomplete?.destroy()

// })
</script>

<template>
  <div>
    <section class="hero">
      <div class="hero__bg" :class="{ 'hero__bg--loaded' : bgImageLoaded }" aria-hidden="true"></div>

      <div class="container">
        <h1 class="hero__title">
          It's more than<br />
          just a trip
        </h1>
        <!-- ===== Search Bar ===== -->
        <form class="search-bar d-flex" role="search" @submit.prevent="searchFlight">
          <div class="search-bar__field">
            <span class="material-symbols-outlined">
              flight_takeoff
            </span>
            <input v-model="departureInput" ref="departureInputEl" type="text" class="search-bar__input autocomplete" placeholder="From where?" aria-label="Departure city" autocomplete="off">
            <!-- Показываем результаты -->
            <ul v-if="departureResults.length" class="autocomplete-list">
              <li v-for="airport in departureResults" :key="airport.id" class="autocomplete-list__item" @click="selectDeparture(airport)">
                {{ airport.name }} ({{ airport.code }})
              </li>
            </ul>
          </div>
          <!--  -->
          <div class="search-bar__field">
            <span class="material-symbols-outlined">
              flight_land
            </span>
            <input v-model="destinationInput" ref="destinationInputEl" type="text" class="search-bar__input autocomplete" placeholder="Where to?" aria-label="Destination city" autocomplete="off">
            <!-- Показываем результаты -->
            <ul v-if="destinationResults.length" class="autocomplete-list">
              <li v-for="airport in destinationResults" :key="airport.id" class="autocomplete-list__item" @click="selectDestination(airport)">
                {{ airport.name }} ({{ airport.code }})
              </li>
            </ul>
          </div>
          <!--  -->
          <div class="search-bar__field date-field">
            <span class="material-symbols-outlined">
              date_range
            </span>
            <!-- <input ref="departInput" type="text" class="search-bar__input" placeholder="Depart" aria-label="Departure date" readonly> -->
            <VueDatePicker 
              v-model="departDate"
              :min-date="new Date()"
              format="dd MMM yyyy"
              placeholder="Depart"
              :enable-time-picker="false"
              auto-apply
              input-class="search-bar__input"
              :calendar-icon="false"
              :teleport="true"
             />
          </div>
          <!--  -->
          <div class="search-bar__field date-field">
            <span class="material-symbols-outlined">
              date_range
            </span>
            <!-- <input ref="returnInput" type="text" class="search-bar__input" placeholder="Return" aria-label="Return date" readonly> -->
             <VueDatePicker
                v-model="returnDate"
                :min-date="departDate || new Date()"
                format="dd MMM yyyy"
                placeholder="Return"
                :enable-time-picker="false"
                auto-apply
                input-class="search-bar__input"
                :calendar-icon="false"
                :teleport="true" 
              />
          </div>
          <!--  -->
          <button type="submit" class="search-bar__btn">Search</button>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 4rem 0 6rem;
  /* overflow: hidden; */
  overflow: visible;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  /* По умолчанию показываем градиент */
  background-color: #f5f3ff;
  background-image: 
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(124, 58, 237, 0.15) 0px, transparent 50%),
    repeating-linear-gradient(45deg, rgba(99, 102, 241, 0.03) 0px, rgba(99, 102, 241, 0.03) 1px, transparent 1px, transparent 20px),
    repeating-linear-gradient(-45deg, rgba(99, 102, 241, 0.03) 0px, rgba(99, 102, 241, 0.03) 1px, transparent 1px, transparent 20px);
  
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.4; /* Делаем фон более бледным, чтобы текст читался */
}
/* СТИЛЬ ДЛЯ УСПЕШНО ЗАГРУЖЕННОГО ИЗОБРАЖЕНИЯ */
.hero__bg--loaded {
  background-image: url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=2000&q=80");
}


/* Добавляем фиолетовый оттенок поверх картинки */
.hero__bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%);
}

/* ВАЖНО: Поднимаем контент НАД фоном */
.hero .container {
  position: relative;
  z-index: 1;
  width: 100%;
}

.hero__title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  margin-bottom: 3rem;
  color: #1f2937; /* Темный цвет для контраста на светлом фоне */
}

/* Базовые стили для формы поиска, чтобы она была видна */
.search-bar {
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  /* box-shadow: 0 10px 40px rgba(99, 102, 241, 0.15); */
  padding: 2px;
  width: 100%;
  max-width: 1000px;
  outline: 1px solid #CBD4E6;
  box-shadow: 0 0 8px 2px #CBD4E6;
}
/*  */
.search-bar__field {
  display: flex;
  position:relative; /** для позиционирования autocomplete-list */
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-right: 1px solid var(--avia-border, #e5e7eb);
  flex: 1;
  min-width: 0;
}
.autocomplete-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;

  margin: 0;
  padding: 0;
  list-style: none;

  background: #fff;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;

  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.autocomplete-list__item {
  padding: 10px 15px;
  cursor: pointer;
}
.autocomplete-list__item:hover {
  background: #f5f5f5;
}
/*  */
.search-bar__field:last-of-type {
  border-right: none;
}

.search-bar__input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
  color: #111;
  background: transparent;
}

.search-bar__btn {
  background-color: var(--avia-primary, #6366f1);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.85rem 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-bar__btn:hover {
  background-color: var(--avia-primary-dark, #4f46e5);
}
.material-symbols-outlined {
  padding-left: 1rem;
  cursor: pointer;
}
/* =========================
   VueDatePicker
========================= */
/* =========================
   VueDatePicker Overrides
========================= */

.date-field {
  padding: 0 !important;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Чтобы выровнять с иконкой material-symbols-outlined */
}

/* 1. Скрываем иконку календаря (точно по классам из твоего HTML) */
.date-field :deep(.dp--input-icon),
.date-field :deep(.dp--input-icons) {
  display: none !important;
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* На всякий случай скрываем div-обёртку вокруг иконки, чтобы она не занимала место */
.date-field :deep(.dp--input-wrap > div) {
  display: none !important;
}

/* 2. Убираем лишние отступы, которые создаёт иконка */
.date-field :deep(.dp--input-icon-pad) {
  padding-right: 0 !important;
  padding-left: 0 !important;
}

/* 3. Стили для самого input (совместимо с .search-bar__input) */
.date-field :deep(.dp--input) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
  font-family: 'Inter', sans-serif !important; /* Шрифт из index.html */
  font-size: 0.95rem !important;
  color: #111 !important;
  min-height: auto !important;
  height: auto !important;
  cursor: pointer !important;
}

/* 4. Placeholder делаем чёрным/тёмным, как в обычных инпутах */
.date-field :deep(.dp--input::placeholder) {
  color: #111 !important; /* Или #1f2937, если хочешь чуть мягче, как у заголовка */
  opacity: 1 !important;
  font-family: 'Inter', sans-serif !important;
}

/* 5. Убираем стили обёртки при фокусе и в обычном состоянии */
.date-field :deep(.dp--input-wrap) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.date-field :deep(.dp--input-wrap:focus-within) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* 6. Переопределение переменных темы (на всякий случай) */
.date-field :deep(.dp--theme-light) {
  --dp-border-color: transparent !important;
  --dp-border-radius: 0 !important;
  --dp-border-color-hover: transparent !important;
  --dp-border-color-focus: transparent !important;
}
/*  */
/* Адаптив для мобильных */
@media (max-width: 991.98px) {
  .search-bar {
    flex-direction: column;
  }
  .search-bar__field {
    border-right: none;
    border-bottom: 1px solid var(--avia-border, #e5e7eb);
  }
  .search-bar__field:last-of-type {
    border-bottom: none;
  }
  .search-bar__btn {
    width: 100%;
    margin-top: 0.5rem;
  }
}
</style>