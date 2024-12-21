<template>
  <header class="header">
    <div class="header__container">
      <h1 class="header__title">aPi-hour</h1>
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

  &__title {
    font-size: 1.5rem;
    font-weight: bold;
  }
}
</style>