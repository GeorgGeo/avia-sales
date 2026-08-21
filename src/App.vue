<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore(); // Получаем доступ к хранилищу Vuex

onMounted(() => {
  // Диспатчим экшен для получения данных при монтировании компонента
  store.dispatch('tickets/fetchTickets');
});

</script>

<template>
  <div>
    <h1>You did it!</h1>
    <p>
      Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
      documentation
    </p>
    <button type="button" class="btn btn-primary">Primary</button>
    <button type="button" class="btn btn-secondary">Secondary</button>
    <button type="button" class="btn btn-success">Success</button>
    <button type="button" class="btn btn-danger">Danger</button>
    <button type="button" class="btn btn-warning">Warning</button>
    <button type="button" class="btn btn-info">Info</button>
    <button type="button" class="btn btn-light">Light</button>
    <button type="button" class="btn btn-dark">Dark</button>

    <button type="button" class="btn btn-link">Link</button>
  </div>
</template>

<style scoped></style>
