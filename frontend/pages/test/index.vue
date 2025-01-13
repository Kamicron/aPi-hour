<template>
  <div class='test'>
    <button class="btn">Bouton classique</button>
    <button class="btn btn--danger">Danger</button>
    <button class="btn btn--success">Succès</button>
    <button class="btn btn--warning">Avertissement</button>
    <button class="btn btn--outline">Contour</button>
    <button class="btn btn--ghost">Fantôme</button>
    <button class="btn btn--icon">
      <i class="fa-solid fa-house"></i>
    </button>
    <button class="btn btn--large">Grand</button>
    <button class="btn btn--small">Petit</button>
    <button class="btn btn--rounded">Arrondi</button>
    <pi-loader />

    <pi-checkbox id="checkbox1" v-model="isChecked">Accepter les termes</pi-checkbox>

    <div class="container">
      <div class="container__test">
        Small
      </div>
      <div class="container__large">
        Large
      </div>
    </div>
    
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

const isChecked = ref(false);
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
.test {
  margin:20px;

  .container {
    container-type: size;
    container-name: test-container;
    background-color: red;
    width: 800px;
    height: 800px;
    position: relative;

    &__test {
      display: block;
      color: white;
      padding: 20px;
    }

    &__large {
      display: none;
      color: white;
      padding: 20px;
    }
  }

  @container test-container (min-height: 600px) and (min-width: 800px) {
    .container__test {
      display: none;
    }

    .container__large {
      display: block;
    }
  }
}
</style>