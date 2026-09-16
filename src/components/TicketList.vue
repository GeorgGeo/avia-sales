<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import TicketItemNew from './TicketItemNew.vue';

const store = useStore(); // Получаем доступ к хранилищу Vuex

// 1. Data from Vuex store (объявляем в первую очередь)

const loading = computed(() => store.getters['tickets/loading']); // Получаем состояние загрузки из хранилища внутри namespaced-модуля('tickets') Vuex 
const error = computed(() => store.getters['tickets/error']); // Получаем состояние про ошибку из хранилища внутри namespaced-модуля('tickets') Vuex
// const tickets = computed(() => store.getters['tickets/tickets']);
const tickets = computed(() => store.getters['tickets/tickets']); // Получаем массив билетов из хранилища внутри namespaced-модуля('tickets') Vuex

// 2. ЛОКАЛЬНОЕ СОСТОЯНИЕ (REF)

// Sort
const sortBy = ref('price'); // Переменная для хранения выбранного критерия сортировки, состояние выбранной сортировки

// Filters
const stopsFilter = ref('all'); // Переменная для хранения выбранного фильтра по количеству пересадок, состояние выбранного фильтра

const minPrice = ref(''); // Переменная для хранения минимальной цены, состояние минимальной цены
const maxPrice = ref(''); // Переменная для хранения максимальной цены, состояние максимальной цены

const selectedAirlines = ref([]); // Переменная для хранения выбранных авиакомпаний, состояние выбранных авиакомпаний

// Mobile filters
const filtersOpen = ref(false); // Переменная для хранения состояния открытия фильтров на мобильных устройствах

// 3. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА (COMPUTED)

// Получаем список авиакомпаний
const availableAirlines = computed(() => {
  return [...new Set(tickets.value.map(ticket => ticket.airline).filter(Boolean))].sort(); // Создаем уникальный список авиакомпаний из билетов и сортируем его
});

// Available price range
const availableMinPrice = computed(() => {
  const prices = tickets.value.map(ticket => Number(ticket.price)).filter(price => Number.isFinite(price)); // Получаем массив цен билетов, фильтруем только конечные числа
  return prices.length ? Math.min(...prices) : 0; // Если есть цены, возвращаем минимальную цену, иначе 0
});

const availableMaxPrice = computed(() => {
  const prices = tickets.value.map(ticket => Number(ticket.price)).filter(price => Number.isFinite(price)); // Получаем массив цен билетов, фильтруем только конечные числа
  return prices.length ? Math.max(...prices) : 0; // Если есть цены, возвращаем максимальную цену, иначе 0
});

// Когда приходит новый набор билетов, устанавливаем новый диапазон цены.
watch([availableMinPrice, availableMaxPrice], ([newMin, newMax]) => {
  minPrice.value = newMin; // Устанавливаем минимальную цену
  maxPrice.value = newMax; // Устанавливаем максимальную цену
}, { immediate: true } // Выполняем сразу при инициализации
);

// Stops option, чтобы не хардкодить в шаблоне
const stopsOptions = [
  { value: 'all', label: 'All flights' },
  { value: 'direct', label: 'Direct' },
  { value: 'one', label: '1 Stop' },
  { value: 'twoPlus', label: '2+ Stops' }
]

// Total Stops, чтобы не дублировать код в фильтре и сортировке
const getTotalStops = (ticket) => {
  return (ticket.transfers ?? 0) + (ticket.return_transfers ?? 0); // Суммируем количество пересадок туда и обратно для текущего билета
}

// Теперь создаём filteredTickets, вот это будет главная часть фильтрации.
const filteredTickets = computed(() => {
  return tickets.value.filter(ticket => {

    // -------------------------
    // STOPS
    // -------------------------

    // Фильтрация по количеству пересадок
    // const totalStops = (ticket.transfers ?? 0) + (ticket.return_transfers ?? 0); // Суммируем количество пересадок туда и обратно для текущего билета
    const totalStops = getTotalStops(ticket); // Получаем общее количество пересадок для текущего билета

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

const sortedTickets = computed(() => {
  // const result = [...tickets.value]; // Создаем копию массива билетов, чтобы не мутировать исходный массив
  const result = [...filteredTickets.value]; // Создаем копию массива отфильтрованных билетов, чтобы не мутировать исходный массив

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
        // const stopsA = (a.transfers ?? 0) + (a.return_transfers ?? 0); // Суммируем количество пересадок туда и обратно для билета A
        const stopsA = getTotalStops(a); // Получаем общее количество пересадок для билета A
        const stopsB = getTotalStops(b); // Получаем общее количество пересадок
        // const stopsB = (b.transfers ?? 0) + (b.return_transfers ?? 0); // Суммируем количество пересадок туда и обратно для билета B
        return stopsA - stopsB; // Сортировка по возрастанию количества пересадок
      })
    default:
      return result; // Если сортировка не выбрана, возвращаем исходный массив
  }
});

// 4. МЕТОДЫ И ДОПОЛНИТЕЛЬНЫЕ WATCHERS

// Создаём переменную для хранения состояния фильтров, чтобы можно было сбросить их в исходное состояние
const resetFilters = () => {
  stopsFilter.value = 'all'; // Сбрасываем фильтр по количеству пересадок
  // minPrice.value = ''; // Сбрасываем минимальную цену
  // maxPrice.value = ''; // Сбрасываем максимальную цену
  minPrice.value = availableMinPrice.value; // Сбрасываем минимальную цену на доступную минимальную цену
  maxPrice.value = availableMaxPrice.value; // Сбрасываем максимальную цену на доступную максимальную цену

  selectedAirlines.value = []; // Сбрасываем выбранные авиакомпании

  sortBy.value = 'price'; // Сбрасываем сортировку на "price"
};

// PRICE SLIDER SAFETY
watch(minPrice, value => {

  if (value === '' || value === null) {
    return; // Если значение пустое или null, выходим из функции
  }

  if (Number(value) > Number(maxPrice.value)) {
    maxPrice.value = value;
  }
});

watch(maxPrice, value => {

  if (value === '' || value === null) {
    return; // Если значение пустое или null, выходим из функции
  }

  if (Number(value) < Number(minPrice.value)) {
    minPrice.value = value;
  }
});

// MOBILE FILTER CLOSE
const closeFilters = () => {
  filtersOpen.value = false; // Закрываем фильтры на мобильных устройствах
}

</script>

<template>
  <div>
    <section class="ticket-list">
      <!-- если есть loading, и он true, то показываем сообщение -->
      <div v-if="loading" class="ticket-list__loading">Loading flights...</div>
      <!-- если есть error, и он не null, то показываем сообщение -->
      <div v-else-if="error" class="ticket-list__error">Something went wrong while loading flights</div>
      <!-- если нет билетов, то показываем сообщение -->
      <div v-else-if="!tickets.length" class="ticket-list__empty">
        <i class="bi bi-airplane"></i>

        <h3> No flights found </h3>

        <p> Try changing your search dates or route </p>
      </div>

      <!-- Results -->
      <template v-else>
        <!-- <div class="ticket-list__header">
          <h2>Available Flights</h2>

          <span>{{ sortedTickets.length }} flights available</span>

          <div class="ticket-list__sort">
            <label for="sortBy">Sort by:</label>
            <select id="sortBy" v-model="sortBy" class="form-select">
              <option value="price">Price</option>
              <option value="duration">Duration</option>
              <option value="stops">Stops</option>
            </select>
          </div>
        </div> -->
        <div class="tickets-layout">
          <!-- FILTER SIDEBAR / MOBILE DRAWER -->
          <aside class="filters-sidebar" :class="{ 'filters-sidebar--open' : filtersOpen }">
            <div class="filters-sidebar__header">
              <h2>Filters</h2>

              <button type="button" @click="closeFilters" class="filters-sidebar__close">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <!-- STOPS -->
            <!-- <div class="filters-sidebar__filter">
              <h4>Stops</h4>

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
              </label> -->
            <section class="filter-section">
              <h3>Stops</h3>

              <label v-for="option in stopsOptions" :key="option.value" class="filter-option">
                <input type="radio" v-model="stopsFilter" :value="option.value" />

                <span>{{ option.label }}</span>

              </label>
            </section>
            <!-- PRICE -->
            <section class="filter-section">
              <h3>Price</h3>

              <div class="price-values">
                <span>${{ minPrice }}</span>
                <span>${{ maxPrice }}</span>
              </div>

              <div class="price-range">
                <input type="range" v-model.number="minPrice" :min="availableMinPrice" :max="availableMaxPrice" :disabled="availableMinPrice === availableMaxPrice">
                
                <input type="range" v-model.number="maxPrice" :min="availableMinPrice" :max="availableMaxPrice" :disabled="availableMinPrice === availableMaxPrice">
              </div>
              <!-- Optional manual inputs -->
              <div class="price-inputs">
                <input type="number" v-model.number="minPrice" :min="availableMinPrice" :max="availableMaxPrice" placeholder="Min" class="form-control" />

                <input type="number" v-model.number="maxPrice" :min="availableMinPrice" :max="availableMaxPrice" placeholder="Max" class="form-control" />
              </div>
            </section>
            <!-- AIRLINES -->
            <section class="filter-section">
              <h3>Airlines</h3>

              <label v-for="airline in availableAirlines" :key="airline" class="filter-option">
                <input type="checkbox" v-model="selectedAirlines" :value="airline" />

                <span>{{ airline }}</span>
              </label>
            </section>

            <!-- RESET -->
            <button type="button" @click="resetFilters" class="filters-reset">Reset All</button>
          </aside>

          <!-- =================================
               MOBILE OVERLAY
          ================================== -->
          <div class="filters-overlay" v-if="filtersOpen" @click="closeFilters"></div>

          <!-- =================================
               RESULTS
          ================================== -->
          <section class="tickets-results">
            <div class="results-header">
              <!-- TITLE -->
              <div class="results-title">
                <h2>Available Flights</h2>

                <span>{{ sortedTickets.length }} {{ sortedTickets.length === 1 ? 'flight' : 'flights' }}</span>
              </div>
              <!-- ACTIONS -->
              <div class="results-actions">
                <!-- MOBILE FILTER BUTTON -->
                <button type="button" @click="filtersOpen = true" class="mobile-filter-button">
                  <i class="bi bi-sliders"></i>
                  Filters
                </button>

                <!-- SORT -->
                <div class="results-sort">
                  <label for="sortBy">Sort by:</label>
                  <select id="sortBy" v-model="sortBy" class="results-sort__select">
                    <option value="price">Cheapest</option>
                    <option value="duration">Shortest</option>
                    <option value="stops">Fewest stops</option>
                  </select>
                </div>
              </div>
            </div>
            <!-- =================================
                 NO RESULTS AFTER FILTERING
            ================================== -->
            <div class="tickt-list__filtered-empty" v-if="!sortedTickets.length">
              <i class="bi bi-sliders"></i>

              <h3> No flights match your filters </h3>

              <p> Try changing your filters or reset them. </p>

              <button type="button" @click="resetFilters" class="btn btn-primary">Reset filters</button>

            </div>
            <!-- =================================
                 TICKETS
            ================================== -->
            <div v-else class="ticket-list__items">
              <TicketItemNew v-for="ticket in sortedTickets" :key="ticket.id || ticket.link" :ticket="ticket" />
            </div>
          </section>

        </div>
        <!-- /.tickets-layout -->
        <!-- Интерфейс  фильтров -->
        <!-- <div class="ticket-list__filters"> -->
          <!-- STOPS -->
          <!-- <div class="ticket-list__filter">
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
          </div> -->

          <!-- PRICE -->
          <!-- <div class="ticket-list__filter">
            <h3>Price</h3>

            <div class="ticket-list__price-inputs">
              <input type="number" v-model="minPrice" min="0" placeholder="Min" class="form-control" />
              <input type="number" v-model="maxPrice" min="0" placeholder="Max" class="form-control" />
            </div>
          </div> -->

          <!-- AIRLINES -->
          <!-- <div class="ticket-list__filter">
            <h3>Airlines</h3>

            <label v-for="airline in availableAirlines" :key="airline">
              <input type="checkbox" v-model="selectedAirlines" :value="airline" />

              <span>{{ airline }}</span>
            </label>
          </div> -->

          <!-- <button type="button" @click="resetFilters" class="btn btn-outline-secondary">Reset filters</button> -->
        <!-- </div> -->
        <!-- End filters -->
        <!-- <div class="ticket-list__items"> -->
          <!-- <TicketItem v-for="ticket in tickets" :key="ticket.id || ticket.link" :ticket="ticket" /> -->
          <!-- <TicketItem v-for="ticket in sortedTickets" :key="ticket.id || ticket.link" :ticket="ticket" /> -->
        <!-- </div> -->
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
/*  */
/* =================================
   LAYOUT
================================= */

.tickets-layout {
  display: grid;

  grid-template-columns: 250px minmax(0, 1fr);

  gap: 24px;

  align-items: start;
}


/* =================================
   FILTER SIDEBAR
================================= */

.filters-sidebar {
  position: sticky;
  top: 20px;

  padding: 20px;

  background: #fff;

  border: 1px solid var(--avia-border);
  border-radius: 16px;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  z-index: 10;
}

.filters-sidebar__header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding-bottom: 16px;

  border-bottom: 1px solid var(--avia-border);
}

.filters-sidebar__header h2 {
  margin: 0;

  font-size: 18px;
  font-weight: 700;
}

.filters-sidebar__close {
  display: none;

  border: 0;
  background: transparent;

  font-size: 20px;

  color: var(--avia-muted);
}


/* =================================
   FILTER SECTION
================================= */

.filter-section {
  padding: 20px 0;

  border-bottom: 1px solid var(--avia-border);
}

.filter-section h3 {
  margin: 0 0 12px;

  font-size: 14px;
  font-weight: 700;

  color: var(--avia-text);
}


/* =================================
   RADIO / CHECKBOX
================================= */

.filter-option {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 7px 0;

  cursor: pointer;

  font-size: 14px;

  color: #495057;
}

.filter-option input {
  width: 16px;
  height: 16px;

  margin: 0;

  accent-color: var(--avia-primary);
}


/* =================================
   PRICE
================================= */

.price-values {
  display: flex;

  justify-content: space-between;

  margin-bottom: 8px;

  font-size: 13px;
  font-weight: 600;

  color: var(--avia-text);
}

.price-range {
  position: relative;

  display: flex;
  flex-direction: column;

  gap: 4px;

  margin-bottom: 14px;
}

.price-range input {
  width: 100%;

  margin: 0;

  accent-color: var(--avia-primary);
}

.price-inputs {
  display: flex;

  gap: 8px;
}

.price-inputs .form-control {
  min-width: 0;

  padding: 7px 8px;

  font-size: 13px;
}


/* =================================
   RESET
================================= */

.filters-reset {
  width: 100%;

  margin-top: 20px;
  padding: 9px 12px;

  border: 1px solid var(--avia-border);
  border-radius: 10px;

  background: #fff;

  color: var(--avia-primary);

  font-size: 14px;
  font-weight: 600;

  transition: 0.2s ease;
}

.filters-reset:hover {
  background: #f8f9fa;
}


/* =================================
   RESULTS
================================= */

.tickets-results {
  min-width: 0;
}

.results-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 20px;
}

.results-title h2 {
  margin: 0;

  font-size: 24px;
  font-weight: 800;

  color: var(--avia-text);
}

.results-title span {
  display: block;

  margin-top: 4px;

  font-size: 14px;

  color: var(--avia-muted);
}


/* =================================
   ACTIONS
================================= */

.results-actions {
  display: flex;

  align-items: center;

  gap: 10px;
}


/* =================================
   SORT
================================= */

.results-sort {
  display: flex;

  align-items: center;

  gap: 8px;
  height: 38px;
  padding: 0 10px;

  background: #fff;

  border: 1px solid var(--avia-border);
  border-radius: 10px;
}

.results-sort label {
  margin: 0;

  white-space: nowrap;

  font-size: 13px;

  color: var(--avia-muted);
}

.results-sort__select {
  /* padding: 2px 22px 2px 0; */
  height: 30px;
  padding: 0 20px 0 0;
  min-width: 105px;
  border: 0;
  outline: none;

  background-color: transparent;

  font-size: 14px;
  font-weight: 600;

  color: var(--avia-text);

  cursor: pointer;
}


/* =================================
   MOBILE FILTER BUTTON
================================= */

.mobile-filter-button {
  display: none;

  align-items: center;
  justify-content: center;

  gap: 7px;
  height: 38px;
  padding: 0 12px;

  border: 1px solid var(--avia-border);
  border-radius: 10px;

  background: #fff;

  font-size: 14px;
  font-weight: 600;

  color: var(--avia-text);
  white-space: nowrap;
}


/* =================================
   STATES
================================= */

.ticket-list__loading,
.ticket-list__error,
.ticket-list__empty,
.ticket-list__filtered-empty {
  padding: 50px 20px;

  text-align: center;

  background: #fff;

  border: 1px solid var(--avia-border);
  border-radius: 16px;
}

.ticket-list__error {
  color: #dc3545;
}

.ticket-list__empty i,
.ticket-list__filtered-empty i {
  display: block;

  margin-bottom: 12px;

  font-size: 32px;

  color: var(--avia-muted);
}

.ticket-list__empty h3,
.ticket-list__filtered-empty h3 {
  margin-bottom: 8px;

  font-size: 18px;
}

.ticket-list__empty p,
.ticket-list__filtered-empty p {
  margin-bottom: 20px;

  color: var(--avia-muted);
}


/* =================================
   MOBILE OVERLAY
================================= */

.filters-overlay {
  display: none;
}


/* =================================
   TABLET
================================= */

@media (max-width: 991.98px) {

  .tickets-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: fixed;

    top: 0;
    left: 0;

    width: min(320px, 88vw);
    height: 100vh;

    overflow-y: auto;

    border-radius: 0;

    transform: translateX(-100%);

    transition: transform 0.3s ease;

    z-index: 1050;
  }

  .filters-sidebar--open {
    transform: translateX(0);
  }

  .filters-sidebar__close {
    display: block;
  }

  .mobile-filter-button {
    display: inline-flex;
  }

  .filters-overlay {
    display: block;

    position: fixed;

    inset: 0;

    background: rgba(0, 0, 0, 0.35);

    z-index: 1040;
  }

}


/* =================================
   MOBILE
================================= */

@media (max-width: 575.98px) {

  .ticket-list {
    margin-top: 30px;

    padding-left: 12px;
    padding-right: 12px;
  }

  .results-header {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .results-actions {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .results-sort {
    flex: 1;
    /* order: 1; Первый элемент в сетке будет последним */
    min-width: 0;
    height: 38px;
    justify-content: space-between;
  }

  .results-sort__select {
    /* max-width: 130px; */
    min-width: 0;
    width: 100%;
    max-width: 125px;
    height: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mobile-filter-button {
    /* flex-shrink: 0; */
    /* flex: 0 0 auto; */
    flex: 1;
    height: 38px;
    /* order: 2; Второй элемент в сетке будет первым */
  }

}
.results-sort__select,
.results-sort__select::picker(select) {
  appearance: base-select;
}

/* Сам попап со списком опций */
.results-sort__select::picker(select) {
  padding: 6px;
  margin-top: 6px;
  border: 1px solid var(--avia-border);
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Отдельные option */
.results-sort__select option {
  padding: 8px 10px;
  border-radius: 6px;
}

.results-sort__select option:hover,
.results-sort__select option:checked {
  background: var(--avia-primary, #0d6efd);
  color: #fff;
}

/* Сдвигаем попап влево на мобильных, чтобы не вылезал за экран */
@media (max-width: 575.98px) {
  .results-sort__select::picker(select) {
    left: auto;
    right: 0;
    max-width: 90vw;
  }
}
</style>