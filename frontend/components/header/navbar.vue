<template>
  <header class="header">
    <img src="/logo_colored.png" alt="aPi-Hour" class="header__logo" @click="$router.push('/')" />
    
    <nav v-if="!isMobile" class="header__nav">
      <NuxtLink to="/" class="nav-link">
        <i class="fas fa-home"></i>
        <span>Accueil</span>
      </NuxtLink>
      
        <NuxtLink v-if="token" to="/profile" class="nav-link">
          <i class="fas fa-user"></i>
          <span>Profile</span>
        </NuxtLink>
        
        <NuxtLink  v-if="token" to="/vacances" class="nav-link">
          <i class="fas fa-umbrella-beach"></i>
          <span>Vacances</span>
        </NuxtLink>
    </nav>

    <login />
  </header>

  <nav v-if="isMobile" class="mobile-nav">
    <NuxtLink to="/" class="mobile-nav__link">
      <i class="fas fa-home"></i>
      <span>Accueil</span>
    </NuxtLink>
    
      <NuxtLink  v-if="token" to="/profile" class="mobile-nav__link">
        <i class="fas fa-user"></i>
        <span>Profile</span>
      </NuxtLink>
      
      <NuxtLink  v-if="token" to="/vacances" class="mobile-nav__link">
        <i class="fas fa-umbrella-beach"></i>
        <span>Vacances</span>
      </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const token = useCookie('token');


const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style lang="scss" scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  padding: 0 1.5rem;
  background: $color-surface;
  display: flex;
  align-items: center;
  z-index: 1000;
  justify-content: space-between;
  align-items: center;
  box-shadow: $box-shadow-dark;

  &__logo {
    height: 80px;
    cursor: pointer;
  }

  &__nav {
    display: flex;
    gap: 2rem;
    margin-left: 3rem;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: $color-text-primary;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 8px;
  
  i {
    font-size: 1.2rem;
  }
  
  &:hover, &.router-link-active {
    color: $color-primary;
  }
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: $color-surface;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: $box-shadow-dark;

  &__link {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: $color-text-primary;
    text-decoration: none;
    gap: 0.25rem;
    
    i {
      font-size: 1.5rem;
    }
    
    span {
      font-size: 0.75rem;
    }
    
    &:hover, &.router-link-active {
      color: $color-primary;
    }
  }
}

:global(#__nuxt) {
  padding-top: 60px;
  
  @media (max-width: 768px) {
    padding-bottom: 60px;
  }
}

@media (min-width: 769px) {
  .header {
    :deep(.auth-widget) {
      margin-left: auto;
    }
  }
}
</style>
