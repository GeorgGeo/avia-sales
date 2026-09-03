<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import TicketItem from './TicketItem.vue';

const store = useStore(); // Получаем доступ к хранилищу Vuex

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

          <span>{{ tickets.length }} flights available</span>
        </div>

        <div class="ticket-list__items">
          <TicketItem v-for="ticket in tickets" :key="ticket.id || ticket.link" :ticket="ticket" />
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.tickets-list {
  width: 100%;
  max-width:1200px;
  margin: 40px auto 0;
  padding: 0 20px 60px;
}
.ticket-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.ticket-list__header h2 {
  margin: 0;
}
.ticket-list__header span {
  color: #777;
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
</style>