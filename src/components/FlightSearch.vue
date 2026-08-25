<script setup>
</script>

<template>
  <div>
    <section class="hero">
      <div class="hero_bg" aria-hidden="true"></div>

      <div class="container">
        <h1 class="hero__title">
          It's more than<br />
          just a trip
        </h1>
        <!-- ===== Search Bar ===== -->
        <form class="search-bar d-flex" role="search">
          <div class="search-bar__field">
            <span class="material-symbols-outlined">
              flight_takeoff
            </span>
            <input type="text" class="search-bar__input" placeholder="From where" aria-label="Departure city">
          </div>
          <!--  -->
          <div class="search-bar__field">
            <span class="material-symbols-outlined">
              flight_land
            </span>
            <input type="text" class="search-bar__input" placeholder="Where to?" aria-label="Destination city">
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>

</style>