<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import TicketItem from './TicketItem.vue';

const store = useStore(); // Получаем доступ к хранилищу Vuex

const sortBy = ref('price'); // Переменная для хранения выбранного критерия сортировки, состояние выбранной сортировки

const stopsFilter = ref('all'); // Переменная для хранения выбранного фильтра по количеству пересадок, состояние выбранного фильтра

const minPrice = ref(''); // Переменная для хранения минимальной цены, состояние минимальной цены
const maxPrice = ref(''); // Переменная для хранения максимальной цены, состояние максимальной цены

const selectedAirlines = ref([]); // Переменная для хранения выбранных авиакомпаний, состояние выбранных авиакомпаний

// Получаем список авиакомпаний
const availableAirlines = computed(() => {
  return [...new Set(tickets.value.map(ticket => ticket.airline).filter(Boolean))].sort(); // Создаем уникальный список авиакомпаний из билетов и сортируем его
});
// Теперь создаём filteredTickets, вот это будет главная часть фильтрации.
const filtredTickets = computed(() => {
  return tickets.value.filter(ticket => {

    // -------------------------
    // STOPS
    // -------------------------
    
    // Фильтрация по количеству пересадок
    const totalStops = (ticket.transfers ?? 0) + (ticket.return_transfers ?? 0); // Суммируем количество пересадок туда и обратно для текущего билета

    // 1. Если выбран фильтр "прямой", а пересадок больше 0 -> выкидываем
    if (stopsFilter.value === 'direct' && totalStops !== 0) {
      return false; // Если выбран фильтр "direct" и текущий билет имеет пересадки, исключаем его
    }
    // 2. Если выбран фильтр "one", а пересадок не равно 1 -> выкидываем
    if (stopsFilter.value === 'one' && totalStops !== 1) {
      return false; // Если выбран фильтр "one" и текущий билет не имеет ровно одну пересадку, исключаем его
    }
    // 3. Если выбран фильтр "twoPlus", а пересадок меньше 2 -> выкидываем
    if (stopsFilter.value === 'twoPlus' && totalStops < 2) {
      return false; // Если выбран фильтр "twoPlus" и текущий билет имеет меньше двух пересадок, исключаем его
    }

    // -------------------------
    // PRICE
    // -------------------------

    const price = Number(ticket.price); // Преобразуем цену билета в число

    // Фильтрация по цене
    if (minPrice.value !== '' && price < Number(minPrice.value)) {
      return false; // Если указана минимальная цена и текущий билет не соответствует, исключаем его
    }
    if (maxPrice.value !== '' && price > Number(maxPrice.value)) {
      return false; // Если указана максимальная цена и текущий билет не соответствует, исключаем его
    }

    // -------------------------
    // AIRLINES
    // -------------------------

    // Фильтрация по авиакомпаниям
    if (selectedAirlines.value.length > 0 && !selectedAirlines.value.includes(ticket.airline)) {
      return false; // Если выбраны авиакомпании и текущий билет не соответствует, исключаем его
    }

    // -------------------------
    // TICKET PASSED ALL FILTERS
    // -------------------------

    return true; // Если билет прошел все фильтры, возвращаем true
  });
});

// Создаём переменную для хранения состояния фильтров, чтобы можно было сбросить их в исходное состояние
const resetFilters = () => {
  stopsFilter.value = 'all'; // Сбрасываем фильтр по количеству пересадок
  minPrice.value = ''; // Сбрасываем минимальную цену
  maxPrice.value = ''; // Сбрасываем максимальную цену
  selectedAirlines.value = []; // Сбрасываем выбранные авиакомпании
};

const sortedTickets = computed(() => {
  // const result = [...tickets.value]; // Создаем копию массива билетов, чтобы не мутировать исходный массив
  const result = [...filtredTickets.value]; // Создаем копию массива отфильтрованных билетов, чтобы не мутировать исходный массив

  switch(sortBy.value) {
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
        <!-- Интерфейс  фильтров -->
        .ticket-list__filters
        <div class="ticket-list__filters">
          <!-- STOPS -->
          <div class="ticket-list__filter">
            <h3>Stops</h3>

            <label>
              <input type="radio" value="all" v-model="stopsFilter" />
              <span>All</span>
            </label>

            <label>
              <input type="radio" value="direct" v-model="stopsFilter" />
              <span>Direct</span>
            </label>

            <label>
              <input type="radio" value="one" v-model="stopsFilter" />
              <span>1 Stop</span>
            </label>

            <label>
              <input type="radio" value="twoPlus" v-model="stopsFilter" />
              <span>2+ Stops</span>
            </label>
          </div>

          <!-- PRICE -->
          <div class="ticket-list__filter">
            <h3>Price</h3>

            <div class="ticket-list__price-inputs">
              <input type="number" v-model="minPrice" min="0" placeholder="Min" class="form-control" />
              <input type="number" v-model="maxPrice" min="0" placeholder="Max" class="form-control" />
            </div>
          </div>

          <!-- AIRLINES -->
          <div class="ticket-list__filter">
            <h3>Airlines</h3>

            <label v-for="airline in availableAirlines" :key="airline">
              <input type="checkbox" v-model="selectedAirlines" :value="airline" />

              <span>{{ airline }}</span>
            </label>
          </div>

          <button type="button" @click="resetFilters" class="btn btn-outline-secondary">Reset filters</button>
        </div>
        <!-- End filters -->
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
/* Filters */
.ticket-list__filters {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto; /**разбиваем грид-сетку   */
  gap: 20px;
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}
.ticket-list__filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ticket-list__filter h3 {
  margin: 0 0 4px;
  font-size: 15px;
  color: #495057;
  font-weight: 600;
}
.ticket-list__filter label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
}
.ticket-list__price-inputs {
  display: flex;
  gap: 8px;
}
.ticket-list__price-inputs .form-control {
  min-width: 0;
  /* width: 100%; */
}
.ticket-list__filters > button {
  align-self: flex-end;
  white-space: nowrap;
}
/* end filters */
@media (max-width: 991.98px) {
  .ticket-list__filters {
    grid-template-columns: repeat(2, 1fr); /* Разбиваем грид-сетку на 2 колонки */
  }
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
  /* Filters */
  .ticket-list__filters {
    grid-template-columns: 1fr; /* Разбиваем грид-сетку на 1 колонку */
  }
  .ticket-list__price-inputs {
    width: 100%;
  }
  .ticket-list__filters > button {
    width: 100%;
  }
}
</style>