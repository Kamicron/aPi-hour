<template>
  <div class='index'>
    <i class="fa-solid fa-house"></i>
    <session-time />
    <work-session />
    <button @click="isOpen = true">modal</button>
    <modal title="Ma super modal" v-model="isOpen">
      <div>ceci est une modale</div>
      <button @click="isOpen2 = true">modal2</button>
      <modal v-model="isOpen2">
        <div>
          <p>c'est une modalception</p>
        </div>
      </modal>
    </modal>
  </div>
</template>

<script setup lang='ts'>
// ----- Import -----

import { ref } from "vue"

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----

// ------------------

// ------ Const -----

// ------------------

// ---- Reactive ----
const isOpen = ref<boolean>(false)
const isOpen2 = ref<boolean>(false)
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
.index {}
</style>