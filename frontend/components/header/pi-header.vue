<template>
  <header class="header">
    <div class="header__container">
       <img class="header__logo" src="https://api.pi-cto.top/uploads/16d20c54-45bf-4dba-bbc1-9e377f7c224e/1735662932144-logo.png"/>
      <navbar />
      <Login />
    </div>
  </header>
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

<style lang="scss" scoped>
.header {
  background-color: $color-surface;
  box-shadow: $box-shadow-dark;
  padding: 1rem;

  &__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__logo {
    width: 150px;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: bold;
  }
}
</style>