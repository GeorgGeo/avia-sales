<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';


import AviaHeader from './components/AviaHeader.vue';
import FlightSearch from './components/FlightSearch.vue';

const store = useStore(); // Получаем доступ к хранилищу Vuex

onMounted(() => {
  // Диспатчим экшен для получения данных при монтировании компонента
  store.dispatch('tickets/fetchTickets');
});

</script>

<template>
  <div>
    <!--  -->
    <AviaHeader />
    <FlightSearch />
  </div>
</template>

<style scoped></style>
