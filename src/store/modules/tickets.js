
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
    // Последний поиск пользователя
    lastSearch: null,
    // Варианты ближайших дат
    nearbyDates: [],
    nearbyLoading: false,
    nearbyError: null,
  },
  getters: {
    tickets: (state) => state.tickets, // Возвращаем массив билетов
    currency: (state) => state.currency,
    loading: (state) => state.loading,
    error: (state) => state.error,
    // Последний поиск пользователя
    lastSearch: (state) => state.lastSearch,
    // Варианты ближайших дат
    nearbyDates: (state) => state.nearbyDates,
    nearbyLoading: (state) => state.nearbyLoading,
    nearbyError: (state) => state.nearbyError,
  },
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
    },
    // Сохраняем параметры последнего поиска пользователя
    SET_LAST_SEARCH(state, params) {
      state.lastSearch = params;
    },
    // Сохраняем варианты ближайших дат
    SET_NEARBY_DATES(state, dates) {
      state.nearbyDates = dates;
    },
    SET_NEARBY_LOADING(state, loading) {
      state.nearbyLoading = loading;
    },
    SET_NEARBY_ERROR(state, error) {
      state.nearbyError = error;
    },
  },
  // =========================
  // Поиск билетов
  // =========================
  //! Метод store.dispatch в Vuex (хранилище Vue) используется для вызова асинхронных действий (actions)
  actions: {
     async fetchTickets(context, params) {
      try {
        console.log('Fetching tickets...', context);
        console.log('Fetching tickets with params:', params);
        // const response = await apiClient.get('/aviasales/v3/prices_for_dates');
        context.commit('SET_LOADING', true);
        context.commit('SET_ERROR', null);

        // Запоминаем последний поиск
        context.commit('SET_LAST_SEARCH', params);

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
    },

    // =========================
  // Поиск ближайших дат
  // =========================
    async fetchNearbyDates(context, params) {
      try {
        //console.log('Fetching nearby dates...', context);
        console.log('Fetching nearby dates with params:', params);

        // Небольшая защита от ошибок в параметрах, чтобы actions не вызывались без необходимых параметров и не пытался сделать запрос с undefined или null
        if (
          !params?.origin ||
          !params?.destination ||
          !params?.departure_at ||
          !params?.return_at
        ) {
          console.warn('Invalid parameters for nearby dates:', params);
          return;
        }
        context.commit('SET_NEARBY_LOADING', true);// Загрузка данных
        context.commit('SET_NEARBY_ERROR', null);// Ошибка загрузки данных
        context.commit('SET_NEARBY_DATES', []);// Очищаем массив данных

        // Преобразуем параметры обычного поиска
        // в параметры endpoint /api/nearby-dates
        // Это очень хороший пример того, почему frontend и backend API иногда имеют разные контракты и не могут быть связаны через один endpoint
        const nearbyParams = {
          origin: params.origin,
          destination: params.destination,
          depart_date: params.departure_at,
          return_date: params.return_at,
          currency: params.currency,
        };

        const response = await apiClient.get('/nearby-dates', { params: nearbyParams }); // Используем прокси для запросов к API
        console.log('Nearby dates fetched:', response.data);
        // context.commit('SET_TICKETS', response.data);

        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to load nearby dates');// Ошибка загрузки данных
        }// Если запрос не удался

        context.commit('SET_NEARBY_DATES', response.data.data);// выполняет мутацию SET_NEARBY_DATES, для этого нужно иметь соответствующий getter в store. Берёт полученные с сервера данные и передаёт их в мутацию, чтобы сохранить в глобальное состояние (state) хранилища.
        // проверку пустого результата в Vuex
        if (response.data.data.length === 0) {
          console.warn('No nearby dates found for this route and dates');
        }
      } catch (error) {
        console.error('Error fetching nearby dates:', error);

        context.commit('SET_NEARBY_ERROR', error);
        context.commit('SET_NEARBY_DATES', []);// очищаем массив данных

      } finally {
        context.commit('SET_NEARBY_LOADING', false);
      }
    },
  },
};

export default ticketsStore;