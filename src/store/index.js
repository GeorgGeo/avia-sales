import { createStore } from 'vuex'
import tickets from './modules/tickets'

const store = createStore({
  state: {
    // здесь будут ваши данные (например, tickets: [])
  },
  getters: {
    // здесь будут вычисляемые свойства состояния
    // Пример:
    // getFilteredTickets: (state) => (filter) => {
    //   return state.tickets.filter(ticket => ticket.price <= filter.maxPrice)
    // }
  },
  mutations: {
    // здесь будут синхронные изменения состояния
    // Пример:
    // SET_TICKETS(state, tickets) {
    //   state.tickets = tickets
    // }
  },
  actions: {
    // здесь будут асинхронные операции (например, запросы через axios)
    // Пример:
    // async fetchTickets({ commit }) {
    //   const response = await axios.get('/api/tickets')
    //   commit('SET_TICKETS', response.data)
    // }
  },
  modules: {
    tickets,
  }
});

export default store;