<template>
  <div class="session-page">
    <h1>Détails de la session</h1>
    <p>Session ID : {{ id }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const id = route.params.id;
</script>

<style scoped>
/* Ajoutez ici vos styles */
</style>
