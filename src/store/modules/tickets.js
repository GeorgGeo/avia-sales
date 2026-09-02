
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
  //! Метод store.commit используется для вызова мутаций (mutations), которые синхронно и напрямую изменяют состояние (state) в хранилище.
  //! Главное архитектурное правило Vuex: состояние нельзя менять напрямую из компонентов; его можно изменять только внутри мутаций через commit. Это необходимо, чтобы Vuex мог точно отслеживать, когда, где и как изменились данные (например, для работы инструментов разработчика DevTools).
  state: {
    tickets: [],
    currency: 'usd',
    loading: false,
    error: null,
  },
  getters: {},
  mutations: {
    SET_TICKETS(state, tickets) {
      state.tickets = tickets;
    },
    SET_CURRENCY(state, currency) {
      state.currency = currency;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  //! Метод store.dispatch в Vuex (хранилище Vue) используется для вызова асинхронных действий (actions)
  actions: {
     async fetchTickets(context, params) {
      try {
        console.log('Fetching tickets...', context);
        console.log('Fetching tickets with params:', params);
        // const response = await apiClient.get('/aviasales/v3/prices_for_dates');
        context.commit('SET_LOADING', true);
        context.commit('SET_ERROR', null);

        const response = await apiClient.get('/tickets', { params }); // Используем прокси для запросов к API
        console.log('Tickets fetched:', response.data);
        // context.commit('SET_TICKETS', response.data);

        context.commit('SET_TICKETS', response.data.data);
        // проверку пустого результата в Vuex
        if (response.data.data.length === 0) {
          console.warn('No tickets found for this route and dates');
        }
        context.commit('SET_CURRENCY', response.data.currency);

        // console.log('First ticket:', response.data.data[0]);// реальная структуру одного билета
        console.log('Tickets count:', response.data.data.length);
        console.log('First ticket:', response.data.data[0] || 'No tickets found');

      } catch (error) {
        console.error('Error fetching tickets:', error);

        context.commit('SET_ERROR', error);

      } finally {
        context.commit('SET_LOADING', false);
      }
    }
  },

};

export default ticketsStore;