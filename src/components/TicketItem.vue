<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Свойство для передачи данных о билете, берётся из родительского компонента TicketList.vue
  ticket: {
    type: Object,
    required: true,
  },
});

// Полный URL билета
const ticketUrl = computed(() => {
  if (!props.ticket.link) return ''; // Если ссылки нет, возвращаем пустую ссылку

  return new URL(props.ticket.link, 'https://www.aviasales.com').toString(); // Формируем полный URL билета, используя базовый URL
});

// Функция для форматирования времени
const formatTime = (dateTime) => {
  if (!dateTime) return '';

  return new Date(dateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // Форматируем время в формате "часы:минуты"
};

const formatDate = (dateTime) => {
  if (!dateTime) return '';

  return new Date(dateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); // Форматируем дату в формате "день.месяц"
};
// Добавляем количество минут к дате, это нужно для того чтобы корректно отображать время прилета, так как в API прилет приходит с учётом часового пояса
const addMinutes = (dateTime, minutes) => {
  if (!dateTime || !minutes) return null;

  const date = new Date(dateTime); // Создаем объект Date из переданной даты и времени
  date.setMinutes(date.getMinutes() + minutes); // Добавляем количество минут к текущему времени
  return date; // Возвращаем новую дату
};

// Время прилёта прямого/первого направления
const departureArrival = () => {
  return addMinutes(props.ticket.departure_at, props.ticket.duration_to); // Добавляем длительность рейса к времени вылета, чтобы получить время прилёта
};

// Время прилёта обратного направления
const returnArrival = () => {
  return addMinutes(props.ticket.return_at, props.ticket.duration_back); // Добавляем длительность рейса к времени вылета, чтобы получить время прилёта
};

// Форматирование длительности
const formatDuration = (minutes) => {
  if (!minutes) return '';

  const hours = Math.floor(minutes / 60); // Получаем количество часов
  const mins = minutes % 60; // Получаем остаток минут

  if (!mins) {
    return `${hours}h`; // Если минут нет, возвращаем только часы
  }

  return `${hours}h ${mins}m`; // Возвращаем строку в формате "часы:минуты"
};

// Количество пересадок
const formatTransfers = (transfers) => {
  if (transfers === 0) {
    return 'Direct'; // Если пересадок нет, возвращаем "Direct"
  } else if (transfers === 1) {
    return '1 stop'; // Если одна пересадка, возвращаем "1 stop"
  } else {
    return `${transfers} stops`; // Если несколько пересадок, возвращаем количество пересадок
  }
};
</script>

<template>
  <div>
    <article class="ticket-card">
      <!-- OUTBOUND -->
      <div class="ticket-card__route">
        <div class="ticket-card__route-title">
          Outbound
        </div>
        <!--  -->
        <div class="ticket-card__airports">

          <div class="ticket-card__airport">
            <strong>{{ props.ticket.origin_airport }}</strong>

            <span>{{ formatTime(props.ticket.departure_at) }}</span>

            <small> {{ formatDate(props.ticket.departure_at) }}</small>
          </div>
        
          <div class="ticket-card__arrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-arrow-right"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
          <!-- /.ticket-card__arrow -->
        
          <div class="ticket-card__airport">
            <strong>{{ props.ticket.destination_airport }}</strong>
            <span>{{ formatTime(departureArrival()) }}</span>
            <small> {{ formatDate(departureArrival()) }}</small>
          </div>
          <!-- /.ticket-card__airports -->
        </div>
      </div> 
        
      <!-- INFO -->
      <div class="ticket-card__info">

        <div class="ticket-card__info-item">
          <span>Duration</span>
          <strong>{{ formatDuration(props.ticket.duration_to) }}</strong>
        </div>

        <div class="ticket-card__info-item">
          <span>Flight</span>
          <strong>{{ props.ticket.flight_number }}</strong>
        </div>

        <div class="ticket-card__info-item">
          <span>Airline</span>
          <strong>{{ props.ticket.airline }}</strong>
        </div>

        <div class="ticket-card__info-item">
          <span>Stops</span>
          <strong>{{ formatTransfers(props.ticket.transfers) }}</strong>
        </div>

      </div>
      <!-- /.ticket-card__info -->
      

      <!-- RETURN -->
      <div class="ticket-card__route ticket-card__route--return">
        <div class="ticket-card__route-title">
          Return
        </div>

        <div class="ticket-card__airports">
          <div class="ticket-card__airport">
            <strong>
              {{ props.ticket.destination_airport }}
            </strong>

            <span>
              {{ formatTime(props.ticket.return_at) }}
            </span>

            <small>
              {{ formatDate(props.ticket.return_at) }}
            </small>
          </div>

          <div class="ticket-card__arrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>

          <div class="ticket-card__airport">
            <strong>
              {{ props.ticket.origin_airport }}
            </strong>

            <span>
              {{ formatTime(returnArrival()) }}
            </span>

            <small>
              {{ formatDate(returnArrival()) }}
            </small>
          </div>

        </div>
      </div>

      <!-- RETURN INFO -->
      <div class="ticket-card__info ticket-card__info--return">

        <div class="ticket-card__info-item">
          <span>Duration</span>

          <strong>
            {{ formatDuration(props.ticket.duration_back) }}
          </strong>
        </div>

        <div class="ticket-card__info-item">
          <span>Stops</span>

          <strong>
            {{ formatTransfers(props.ticket.return_transfers) }}
          </strong>
        </div>

      </div>

      <!-- PRICE -->
      <div class="ticket-card__price">
        <strong class="ticket-card__price-value">
          {{ props.ticket.price }} {{ props.ticket.currency || 'USD' }}
        </strong>

        <!-- <button type="button" class="btn btn-primary">Select</button> -->
        <a v-if="ticketUrl" :href="ticketUrl" target="_blank" rel="noopener noreferrer" class="btn btn-primary ticket-card__button">
          Select
        </a>

        <button v-else type="button" class="btn btn-secondary ticket-card__button" disabled>
          Unavailable
        </button>
      </div>
      <!-- /.ticket-card__price -->
    </article>
  </div>
</template>

<style scoped>
.ticket-card {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) minmax(220px, 2fr) minmax(140px, 1fr); /* устанавливаем минимальную и максимальную ширину столбцов */
  grid-template-areas:
    "route info price"
    "return return price";
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 20px;
  margin-bottom: 16px;

  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.1);
}
/* =========================
   ROUTE
   ========================= */
.ticket-card__route {
  /* display: flex;
  align-items: center;
  gap: 25px; */
  grid-area: route;
}
.ticket-card__route--return {
  grid-area: return;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}
.ticket-card__route-title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c757d;
}

.ticket-card__airports {
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  gap: 20px;
}
.ticket-card__airport {
  display: flex;
  flex-direction: column;
  /* align-items: center;
  gap: 4px; */
  min-width: 70px;
}

.ticket-card__airport strong {
  font-size: 24px;
  line-height: 1;

  color: #212529;
}

.ticket-card__airport span {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin-top: 6px;
}

.ticket-card__airports small {
  margin-top: 3px;
  font-size: 12px;
  color: #6c757d;
}

.ticket-card__arrow {
  /* font-size: 28px; */
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: #6c757d;
}
/* =========================
   INFO
   ========================= */
.ticket-card__info {
  grid-area: info;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 24px;
}

.ticket-card__info div {
  display: flex;
  flex-direction: column;
}

.ticket-card__info--return {
  display: none;
}
.ticket-card__info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}


.ticket-card__info-item span {
  font-size: 12px;
  color: #6c757d;
}
.ticket-card__info-item strong {
  font-size: 14px;
  color: #212529;
}
/* =========================
   PRICE
   ========================= */
.ticket-card__price {
  grid-area: price;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  padding-left: 20px;
  border-left: 1px solid #e9ecef;
}
.ticket-card__price-value {
  font-size: 24px;
  line-height: 1;

  color: #212529;
}
.ticket-card__button {
  min-width: 110px;
}
/* =========================
   TABLET
   ========================= */

@media (max-width: 991.98px) {

  .ticket-card {
    grid-template-columns: 1fr 1fr;

    grid-template-areas:
      "route price"
      "info price"
      "return return";
  }

  .ticket-card__price {
    border-left: none;

    align-items: flex-end;
  }

}


/* =========================
   MOBILE
   ========================= */

@media (max-width: 575.98px) {

  .ticket-card {
    grid-template-columns: 1fr;

    grid-template-areas:
      "route"
      "info"
      "return"
      "price";

    gap: 20px;

    padding: 18px;

    border-radius: 14px;
  }

  .ticket-card__route--return {
    padding-top: 20px;
  }

  .ticket-card__airports {
    justify-content: space-between;

    gap: 10px;
  }

  .ticket-card__airport {
    flex: 1;
  }

  .ticket-card__airport:last-child {
    text-align: right;
  }

  .ticket-card__airport strong {
    font-size: 22px;
  }

  .ticket-card__airport span {
    font-size: 18px;
  }

  .ticket-card__arrow {
    flex-shrink: 0;
  }

  .ticket-card__info {
    grid-template-columns: repeat(2, 1fr);

    padding-top: 16px;

    border-top: 1px solid #e9ecef;
  }

  .ticket-card__price {
    align-items: stretch;

    padding: 16px 0 0;

    border-top: 1px solid #e9ecef;
  }

  .ticket-card__price-value {
    align-self: flex-end;

    font-size: 24px;
  }

  .ticket-card__button {
    width: 100%;
  }
}
</style>