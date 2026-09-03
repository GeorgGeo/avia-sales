<script setup>

const props = defineProps({
  // Свойство для передачи данных о билете, берётся из родительского компонента TicketList.vue
  ticket: {
    type: Object,
    required: true,
  },
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
</script>

<template>
  <div>
    <article class="ticket-card">
      <div class="ticket-card__route">
        <div class="ticket-card__airport">
          <strong>{{ props.ticket.origin_airport }}</strong>

          <span>{{ formatTime(props.ticket.departure_at) }}</span>

          <small> {{ formatDate(props.ticket.departure_at) }}</small>
        </div>
        <!-- /.ticket-card__airport -->
        
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
          <span>{{ formatTime(props.ticket.return_at) }}</span>
          <small> {{ formatDate(props.ticket.return_at) }}</small>
        </div>
        <!-- /.ticket-card__airport -->
      </div>  
        
      <div class="ticket-card__info">

        <div>
          <span>Flight</span>
          <strong>{{ props.ticket.flight_number }}</strong>
        </div>

        <div>
          <span>Airline</span>
          <strong>{{ props.ticket.airline }}</strong>
        </div>

        <div>
          <span>Transfer</span>
          <strong>{{ props.ticket.transfers }}</strong>
        </div>

      </div>
      <!-- /.ticket-card__info -->
      
      <div class="ticket-card__price">
        <strong>
          {{ props.ticket.price }} {{ props.ticket.currency || 'USD' }}
        </strong>

        <button type="button" class="btn btn-primary">Select</button>
      </div>
      <!-- /.ticket-card__price -->
    </article>
  </div>
</template>

<style scoped>
.ticket-card {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  align-items: center;
  gap: 30px;

  padding: 20px;
  margin-bottom: 16px;

  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.ticket-card__route {
  display: flex;
  align-items: center;
  gap: 25px;
}

.ticket-card__airport {
  display: flex;
  flex-direction: column;
}

.ticket-card__airport strong {
  font-size: 24px;
}

.ticket-card__airport span {
  font-size: 20px;
  font-weight: 600;
}

.ticket-card__airport small {
  color: #777;
}

.ticket-card__arrow {
  font-size: 28px;
}

.ticket-card__info {
  display: flex;
  gap: 30px;
}

.ticket-card__info div {
  display: flex;
  flex-direction: column;
}

.ticket-card__info span {
  font-size: 13px;
  color: #777;
}

.ticket-card__price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.ticket-card__price strong {
  font-size: 24px;
}
</style>