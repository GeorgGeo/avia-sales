<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import TicketItem from './TicketItem.vue';

const store = useStore(); // Получаем доступ к хранилищу Vuex

const sortBy = ref(''); // Переменная для хранения выбранного критерия сортировки, состояние выбранной сортировки

const sortedTickets = computed(() => {
  const result = [...tickets.value]; // Создаем копию массива билетов, чтобы не мутировать исходный массив

  switch(sortBy.value) {
    case 'price-asc':
      return result.sort((a, b) => a.price - b.price); // Сортировка по возрастанию цены
    case 'price':
      return result.sort((a, b) => {
        return Number(a.price) - Number(b.price); // Сортировка по возрастанию цены
      });
    case 'duration':
      return result.sort((a, b) => {
        const durationA = (a.duration_to ?? 0) + (a.duration_back ?? 0); // Суммируем длительность туда и обратно для билета A
        const durationB = (b.duration_to ?? 0) + (b.duration_back ?? 0); // Суммируем длительность туда и обратно для билета B
        return durationA - durationB; // Сортировка по возрастанию длительности
      })
    case 'stops':
      return result.sort((a, b) => {
        const stopsA = (a.transfers ?? 0) + (a.return_transfers ?? 0); // Суммируем количество пересадок туда и обратно для билета A
        const stopsB = (b.transfers ?? 0) + (b.return_transfers ?? 0); // Суммируем количество пересадок туда и обратно для билета B
        return stopsA - stopsB; // Сортировка по возрастанию количества пересадок
      })
    default:
      return result; // Если сортировка не выбрана, возвращаем исходный массив
  }
})

const loading = computed(() => store.getters['tickets/loading']); // Получаем состояние загрузки из хранилища внутри namespaced-модуля('tickets') Vuex 
const error = computed(() => store.getters['tickets/error']);
const tickets = computed(() => store.getters['tickets/tickets']);
</script>

<template>
  <div>
    <section class="ticket-list">
      <!-- если есть loading, и он true, то показываем сообщение -->
      <div v-if="loading" class="ticket-list__loading">Loading flights...</div>
      <!-- если есть error, и он не null, то показываем сообщение -->
      <div v-else-if="error" class="ticket-list__error">Something went wrong while loading flights</div>
      <!-- если нет билетов, то показываем сообщение -->
      <div v-else-if="!tickets.length" class="ticket-list__empty">No flights found</div>


      <template v-else>
        <div class="ticket-list__header">
          <h2>Available Flights</h2>

          <!-- <span>{{ tickets.length }} flights available</span> -->
          <span>{{ sortedTickets.length }} flights available</span>

          <div class="ticket-list__sort">
            <label for="sortBy">Sort by:</label>
            <select id="sortBy" v-model="sortBy" class="form-select">
              <option value="price">Price</option>
              <option value="duration">Duration</option>
              <option value="stops">Stops</option>
            </select>
          </div>
        </div>

        <div class="ticket-list__items">
          <!-- <TicketItem v-for="ticket in tickets" :key="ticket.id || ticket.link" :ticket="ticket" /> -->
          <TicketItem v-for="ticket in sortedTickets" :key="ticket.id || ticket.link" :ticket="ticket" />
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.ticket-list {
  width: 100%;
  max-width:1200px;
  margin: 40px auto 0;
  padding: 0 20px 60px;
}
.ticket-list__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}
.ticket-list__header h2 {
  margin: 0;
}
.ticket-list__header span {
  color: #777;
}
.ticket-list__sort {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ticket-list__sort label {
  white-space: nowrap;
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}
.ticket-list__sort .form-select {
  width: 150px;
  /* font-size: 14px;
  padding: 4px 8px; */
}
.ticket-list__loading,
.ticket-list__error,
.ticket-list__empty {
  padding: 40px;
  text-align: center;
  background: #fff;
  border-radius: 12px;
}
.ticket-list__error {
  color: #dc3545;
}

@media (max-width: 575.98px) {
  .ticket-list {
    padding-left: 12px;
    padding-right: 12px;
  }
  .ticket-list__header {
    flex-direction: column;
    /* align-items: flex-start; */
    align-items: stretch;
  }
  .ticket-list__sort {
    justify-content: space-between;
  }
  .ticket-list__sort .form-select {
    /* width: 100%; */
    width: 150px;
  }
}
</style>