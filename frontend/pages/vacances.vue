<template>
  <div class="page-container">
    <!-- Liste des vacances -->
    <bento-card title="Mes jours non travaillés">
      <vacation-list />
    </bento-card>

    <!-- Composant pour ajouter des vacances -->
    <set-vacation />
  </div>
</template>

<script setup lang="ts">
import VacationList from '~/components/vacation/vacation-list.vue';
</script>

<style lang="scss" scoped>
.page-container {
  padding: $spacing-large;
  display: flex;
  flex-direction: column;
  gap: $spacing-large;
}
</style>
