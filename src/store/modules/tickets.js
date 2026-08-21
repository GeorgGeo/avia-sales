
import apiClient from '@/plugins/axios';

const ticketsStore = {
  namespaced: true, // это нужно для того, чтобы во Vue3 в компонентах можно было обращаться к store через инициализацию хранилища, const store = useStore() и далее store.dispatch('tickets/actionName') или store.getters['tickets/getterName']
  // Этот флаг изолирует геттеры, мутации и экшены. Без него все экшены становятся глобальными, а с ним — они получают префикс модуля: store.dispatch('tickets/actionName') - где tickets - это имя модуля, actionName - имя экшена.
  //! EXAMPLE: В компоненте Vue3, чтобы вызвать экшен из namespaced модуля 'tickets', нужно использовать store.dispatch('tickets/fetchTickets') вместо store.dispatch('fetchTickets').
  // <script setup>
  //import { computed } from 'vue'
  //import { useStore } from 'vuex'
  // Инициализируем хранилище
  //const store = useStore()
  // Получаем state из namespaced модуля 'tickets'
  //const ticketsList = computed(() => store.state.tickets.namespacedStateProperty)
  // Если нужно вызвать action или mutation из этого модуля:
  //const loadTickets = () => {
  //  store.dispatch('tickets/fetchTickets') // 'имя_модуля/имя_экшена'
  //}
  //</script>
  state: {
    tickets: [],
  },
  getters: {},
  mutations: {},
  actions: {
     async fetchTickets(context) {
      try {
        console.log('Fetching tickets...', context);
        // const response = await apiClient.get('/aviasales/v3/prices_for_dates');
        const response = await apiClient.get('/tickets'); // Используем прокси для запросов к API
        console.log('Tickets fetched:', response.data);
        // context.commit('SET_TICKETS', response.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    }
  },

};

export default ticketsStore;