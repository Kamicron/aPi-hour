<template>
  <div class='navbar'>
    <ul class="navbar__list">
      <li class="navbar__item"><NuxtLink to="/" class="navbar__link">Accueil</NuxtLink></li>
      <li class="navbar__item"><NuxtLink to="/profile" class="navbar__link">Profile</NuxtLink></li>
    </ul>
  </div>
</template>

<script setup lang='ts'>
// ----- Import -----

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----

// ------------------

// ------ Const -----

// ------------------

// ---- Reactive ----

// ------------------

// ---- Computed ----

// ------------------

// ------ Hooks -----

// ------------------

// --- Async Func ---

// ------------------

// ---- Function ----

// ------------------


// ------ Watch -----

// ------------------

</script>

<style lang='scss' scoped>
.navbar {
  background-color: $color-background;
  padding: $spacing-medium;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;

  &__list {
    display: flex;
    justify-content: space-between;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    margin: 0 $spacing-medium;
  }

  &__link {
    text-decoration: none;
    font-size: $font-size-base;
    font-weight: bold;
    color: $color-primary-light;
    padding: $spacing-small $spacing-medium;
    border-radius: $border-radius;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: $color-primary;
      color: $color-text-primary;
    }
  }
}
</style>
