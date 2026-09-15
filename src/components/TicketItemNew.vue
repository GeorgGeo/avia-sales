<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Данные билета, переданные из TicketList.vue
  ticket: {
    type: Object,
    required: true,
  },
});

// Полный URL билета
const ticketUrl = computed(() => {
  if (!props.ticket.link) {
    return '';
  }

  return new URL(
    props.ticket.link,
    'https://www.aviasales.com'
  ).toString();
});

// Форматирование времени
const formatTime = (dateTime) => {
  if (!dateTime) {
    return '';
  }

  return new Date(dateTime).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Форматирование даты
const formatDate = (dateTime) => {
  if (!dateTime) {
    return '';
  }

  return new Date(dateTime).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
};

// Добавляем длительность к времени вылета
const addMinutes = (dateTime, minutes) => {
  if (!dateTime || !minutes) {
    return null;
  }

  const date = new Date(dateTime);

  date.setMinutes(date.getMinutes() + minutes);

  return date;
};

// Время прилёта outbound
const departureArrival = () => {
  return addMinutes(
    props.ticket.departure_at,
    props.ticket.duration_to
  );
};

// Время прилёта return
const returnArrival = () => {
  return addMinutes(
    props.ticket.return_at,
    props.ticket.duration_back
  );
};

// Форматирование длительности
const formatDuration = (minutes) => {
  if (!minutes) {
    return '';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!mins) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};

// Форматирование количества пересадок
const formatTransfers = (transfers) => {
  const value = Number(transfers ?? 0);

  if (value === 0) {
    return 'Direct';
  }

  if (value === 1) {
    return '1 stop';
  }

  return `${value} stops`;
};

// Общее количество пересадок туда + обратно
const formatTotalStops = (ticket) => {
  const totalStops =
    Number(ticket.transfers ?? 0) +
    Number(ticket.return_transfers ?? 0);

  if (totalStops === 0) {
    return 'Direct';
  }

  if (totalStops === 1) {
    return '1 stop';
  }

  return `${totalStops} stops`;
};
</script>

<template>
  <article class="ticket-card">

    <!-- =================================
         OUTBOUND
    ================================== -->

    <section class="ticket-card__route">

      <div class="ticket-card__route-title">
        Outbound
      </div>

      <div class="ticket-card__airports">

        <!-- Origin -->
        <div class="ticket-card__airport">
          <strong>
            {{ props.ticket.origin_airport }}
          </strong>

          <span>
            {{ formatTime(props.ticket.departure_at) }}
          </span>

          <small>
            {{ formatDate(props.ticket.departure_at) }}
          </small>
        </div>

        <!-- Arrow -->
        <div class="ticket-card__arrow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>

        <!-- Destination -->
        <div class="ticket-card__airport ticket-card__airport--destination">
          <strong>
            {{ props.ticket.destination_airport }}
          </strong>

          <span>
            {{ formatTime(departureArrival()) }}
          </span>

          <small>
            {{ formatDate(departureArrival()) }}
          </small>
        </div>

      </div>
    </section>


    <!-- =================================
         OUTBOUND INFO
    ================================== -->

    <section class="ticket-card__info">

      <div class="ticket-card__info-item">
        <span>Duration</span>

        <strong>
          {{ formatDuration(props.ticket.duration_to) }}
        </strong>
      </div>

      <div class="ticket-card__info-item">
        <span>Flight</span>

        <strong>
          {{ props.ticket.flight_number }}
        </strong>
      </div>

      <div class="ticket-card__info-item">
        <span>Airline</span>

        <strong>
          {{ props.ticket.airline }}
        </strong>
      </div>

      <div class="ticket-card__info-item">
        <span>Stops</span>

        <strong>
          {{ formatTotalStops(props.ticket) }}
        </strong>
      </div>

    </section>


    <!-- =================================
         RETURN
    ================================== -->

    <section class="ticket-card__route ticket-card__route--return">

      <div class="ticket-card__route-title">
        Return
      </div>

      <div class="ticket-card__airports">

        <!-- Return origin -->
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

        <!-- Arrow -->
        <div class="ticket-card__arrow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>

        <!-- Return destination -->
        <div class="ticket-card__airport ticket-card__airport--destination">
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
    </section>


    <!-- =================================
         PRICE
    ================================== -->

    <div class="ticket-card__price">

      <strong class="ticket-card__price-value">
        {{ props.ticket.price }}
        {{ props.ticket.currency || 'USD' }}
      </strong>

      <a
        v-if="ticketUrl"
        :href="ticketUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="ticket-card__button"
      >
        Select
      </a>

      <button
        v-else
        type="button"
        class="ticket-card__button ticket-card__button--disabled"
        disabled
      >
        Unavailable
      </button>

    </div>

  </article>
</template>

<style scoped>

/* =================================
   CARD
================================= */

.ticket-card {
  display: grid;

  grid-template-columns: minmax(0, 1fr) 150px;

  grid-template-areas:
    "route price"
    "info price"
    "return price";

  gap: 0 24px;

  width: 100%;

  margin-bottom: 16px;
  padding: 22px;

  background: #fff;

  border: 1px solid var(--avia-border);
  border-radius: 16px;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.ticket-card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.08);
}


/* =================================
   ROUTE
================================= */

.ticket-card__route {
  grid-area: route;
}

.ticket-card__route-title {
  margin-bottom: 12px;

  font-size: 11px;
  font-weight: 700;

  letter-spacing: 0.1em;
  text-transform: uppercase;

  color: var(--avia-muted);
}


/* =================================
   AIRPORTS
================================= */

.ticket-card__airports {
  display: flex;

  align-items: center;

  gap: 22px;

  min-width: 0;
}

.ticket-card__airport {
  display: flex;

  flex-direction: column;

  min-width: 75px;
}

.ticket-card__airport--destination {
  text-align: right;
}

.ticket-card__airport strong {
  font-size: 24px;
  line-height: 1;

  color: var(--avia-text);
}

.ticket-card__airport span {
  margin-top: 7px;

  font-size: 19px;
  font-weight: 700;

  line-height: 1.2;

  color: var(--avia-text);
}

.ticket-card__airport small {
  margin-top: 4px;

  font-size: 12px;

  color: var(--avia-muted);
}


/* =================================
   ARROW
================================= */

.ticket-card__arrow {
  display: flex;

  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: var(--avia-muted);
}


/* =================================
   INFO
================================= */

.ticket-card__info {
  grid-area: info;

  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 16px;

  margin-top: 18px;
  padding-top: 16px;

  border-top: 1px solid var(--avia-border);
}

.ticket-card__info-item {
  display: flex;

  flex-direction: column;

  gap: 4px;

  min-width: 0;
}

.ticket-card__info-item span {
  font-size: 11px;

  color: var(--avia-muted);
}

.ticket-card__info-item strong {
  overflow: hidden;

  font-size: 14px;
  font-weight: 600;

  color: var(--avia-text);

  text-overflow: ellipsis;
}


/* =================================
   RETURN
================================= */

.ticket-card__route--return {
  grid-area: return;

  margin-top: 18px;
  padding-top: 18px;

  border-top: 1px solid var(--avia-border);
}


/* =================================
   PRICE
================================= */

.ticket-card__price {
  grid-area: price;

  display: flex;

  flex-direction: column;

  align-items: flex-end;
  justify-content: center;

  gap: 12px;

  padding-left: 20px;

  border-left: 1px solid var(--avia-border);
}

.ticket-card__price-value {
  font-size: 23px;
  font-weight: 800;

  line-height: 1.2;

  white-space: nowrap;

  color: var(--avia-text);
}


/* =================================
   BUTTON
================================= */

.ticket-card__button {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-width: 110px;

  padding: 9px 16px;

  border: 1px solid transparent;
  border-radius: 10px;

  background: var(--avia-primary);

  color: #fff;

  font-size: 14px;
  font-weight: 600;

  text-decoration: none;

  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.ticket-card__button:hover {
  background: var(--avia-primary-dark, #0056b3);

  color: #fff;

  transform: translateY(-1px);
}

.ticket-card__button--disabled {
  background: #adb5bd;

  cursor: not-allowed;
}


/* =================================
   TABLET
================================= */

@media (max-width: 991.98px) {

  .ticket-card {
    grid-template-columns: minmax(0, 1fr) 130px;

    gap: 0 18px;

    padding: 20px;
  }

  .ticket-card__info {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .ticket-card__price {
    padding-left: 16px;
  }

}


/* =================================
   MOBILE
================================= */

@media (max-width: 575.98px) {

  .ticket-card {
    grid-template-columns: 1fr;

    grid-template-areas:
      "route"
      "info"
      "return"
      "price";

    gap: 0;

    padding: 18px;

    border-radius: 14px;
  }


  /* ROUTE */

  .ticket-card__airports {
    justify-content: space-between;

    gap: 10px;
  }

  .ticket-card__airport {
    flex: 1;

    min-width: 0;
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


  /* INFO */

  .ticket-card__info {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 14px;

    margin-top: 18px;
    padding-top: 16px;
  }


  /* RETURN */

  .ticket-card__route--return {
    margin-top: 18px;
    padding-top: 18px;
  }


  /* PRICE */

  .ticket-card__price {
    align-items: stretch;

    margin-top: 18px;
    padding: 16px 0 0;

    border-top: 1px solid var(--avia-border);
    border-left: 0;
  }

  .ticket-card__price-value {
    align-self: flex-end;

    font-size: 22px;
  }

  .ticket-card__button {
    width: 100%;
  }

}

</style>