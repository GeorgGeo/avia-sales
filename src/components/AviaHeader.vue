<script setup>
import { ref } from 'vue';

// Храним ID активной ссылки. По умолчанию пусть это будет 'signup'
const activeLink = ref('signup');

// Функция, которая вызывается при клике и меняет активную ссылку
const setActive = (linkId) => {
  activeLink.value = linkId;
}

</script>

<template>
  <div>
    <header class="site-header">
      <div class="container">
        <nav class="navbar navbar-expand-lg">
          <a href="#" class="site-header__logo navbar-brand me-auto">AviaSales</a>

          <button
            class="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <!--  -->
          <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav align-items-lg-center ms-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a href="#" class="site-header__nav-link nav-link" :class="{'site-header__nav-link--active' : activeLink === 'flights'}" @click.prevent="setActive('flights')">Flights</a>
              </li>
              <li class="nav-item">
                <a href="#" class="site-header__nav-link nav-link" :class="{'site-header__nav-link--active' : activeLink === 'hotels'}" @click.prevent="setActive('hotels')">Hotels</a>
              </li>
              <li class="nav-item">
                <a href="#" class="site-header__nav-link nav-link" :class="{'site-header__nav-link--active' : activeLink === 'packages'}" @click.prevent="setActive('packages')">Packages</a>
              </li>
              <li class="nav-item">
                <a href="#" class="site-header__nav-link nav-link" :class="{'site-header__nav-link--active' : activeLink === 'signin'}" @click.prevent="setActive('signin')">Sign in</a>
              </li>
              <li class="nav-item ms-lg-2">
                <a href="#" class="site-header__nav-link" :class="{'site-header__nav-link--active' : activeLink === 'signup'}" @click.prevent="setActive('signup')">Sign up</a>
              </li>
            </ul>
          </div>
        </nav>
        <!-- /.navbar -->
      </div>
    </header>
  </div>
</template>

<style scoped>
.site-header {
  padding: 1rem 0;
}
.site-header__logo {
  font-weight: 800;
  font-size: 1.6rem;
  color: var(--avia-primary);
  text-decoration: none;
}
.site-header__nav-link {
  color: var(--avia-text-muted);
  text-decoration: none;
  font-weight: 500;
  /* margin: 0 0.75rem; */
  /* Добавляем отступы и границу сразу всем, чтобы размер не прыгал при смене класса */
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: 1px solid transparent; 
  
  transition: all 0.2s ease;
}
/* Этот класс добавляется динамически через :class */
.navbar-nav .site-header__nav-link--active {
  /* color: var(--avia-primary); */
  font-weight: 600;
  background-color: var(--avia-primary);
  color: #ffffff;
  border-color: var(--avia-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25); 
}
/* Ховер для неактивных ссылок */
.navbar-nav .site-header__nav-link:hover {
  color: var(--avia-primary);
  background-color: rgba(99, 102, 241, 0.05); /* Легкий фон при наведении */
}
/* Ховер для активной кнопки */
.navbar-nav .site-header__nav-link.site-header__nav-link--active:hover {
  background-color: var(--avia-primary-dark);
  border-color: var(--avia-primary-dark);
  color: #ffffff;
}

</style>