<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
// import M from '@/plugins/materialize'
import * as Materialize from '@materializecss/materialize'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const bgImageLoaded = ref(false);
const bgImageUrl = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=2000&q=80';

const departureInput = ref(null); // From where
const destinationInput = ref(null); // Where to? 
// const departInput = ref(null);
// const returnInput = ref(null);

const departDate = ref(null);
const returnDate = ref(null);

// Сделаем тестовые данные, чтобы убедиться, что сам компонент работает(Autocomplite)
const airports = [
  { id: 'MAD', text: 'Madrid (MAD)' },
  { id: 'BCN', text: 'Barcelona (BCN)' },
  { id: 'LHR', text: 'London (LHR)' },
  { id: 'CDG', text: 'Paris (CDG)' },
  { id: 'FCO', text: 'Rome (FCO)' },
  { id: 'BER', text: 'Berlin (BER)' },
];

let departureAutocomplete
let destinationAutocomplete

// let departDatepicker
// let returnDatepicker

onMounted(() => {
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

  // Инициализируем Autocomplete
  const autocompleteOptions = {
    minLength: 1,
    data: airports,
  };

  departureAutocomplete = Materialize.Autocomplete.init(
    departureInput.value,
    autocompleteOptions
  );

  destinationAutocomplete = Materialize.Autocomplete.init(
    destinationInput.value,
    autocompleteOptions
  );

  // =========================
  // Datepicker
  // =========================

});

onBeforeUnmount(() => {
  departureAutocomplete?.destroy()
  destinationAutocomplete?.destroy()

})
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
        <form class="search-bar d-flex" role="search">
          <div class="search-bar__field">
            <span class="material-symbols-outlined">
              flight_takeoff
            </span>
            <input ref="departureInput" type="text" class="search-bar__input autocomplete" placeholder="From where?" aria-label="Departure city" autocomplete="off">
          </div>
          <!--  -->
          <div class="search-bar__field">
            <span class="material-symbols-outlined">
              flight_land
            </span>
            <input ref="destinationInput" type="text" class="search-bar__input autocomplete" placeholder="Where to?" aria-label="Destination city" autocomplete="off">
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

.search-bar__field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-right: 1px solid var(--avia-border, #e5e7eb);
  flex: 1;
  min-width: 0;
}

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