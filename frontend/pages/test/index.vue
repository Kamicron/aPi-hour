<template>
  <div class='test'>
    {{ date }}
  </div>
</template>

<script setup lang='ts'>
// ----- Import -----
import { ref } from "vue";
import useDateFormatter from '../../composable/useDate';

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----

// ------------------

// ------ Const -----

// ------------------

// ---- Reactive ----
const date = ref<string | null>(useDateFormatter().calculateDuration("2024-12-20T08:30:00", "2024-12-20T18:45:30", {
  customOptions: {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  },
}))
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
.test {}
</style>