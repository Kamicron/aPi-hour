<template>
  <div class="extra-hours-display">
    <div class="extra-hours-display__header">
      <h1 class="extra-hours-display__title">Calcul des Heures Supplémentaires</h1>
    </div>
    <div class="extra-hours-display__inputs">
      <label class="extra-hours-display__label">
        Date de début :
        <input type="date" v-model="startDate" @change="fetchExtraHours" class="extra-hours-display__input" />
      </label>
      <label class="extra-hours-display__label">
        Date de fin :
        <input type="date" v-model="endDate" @change="fetchExtraHours" class="extra-hours-display__input" />
      </label>
    </div>

    <div class="extra-hours-display__content">
      
      <div v-if="loading" class="extra-hours-display__loading"><loader /></div>
      <div v-if="!loading && !error" class="extra-hours-display__results">
        <p class="extra-hours-display__result">
          <strong>Heures Travaillées :</strong> {{ workedHours }} h
        </p>
        <p class="extra-hours-display__result">
          <strong>Heures de Pause :</strong> {{ pauseHours }} h
        </p>
        <p class="extra-hours-display__result">
          <strong>Heures Contractuelles :</strong> {{ contractualHours }} h
        </p>
        <p class="extra-hours-display__result">
          <strong>Heures Supplémentaires :</strong> {{ extraHours }} h
        </p>
      </div>
      <div v-if="error" class="extra-hours-display__error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ----- Import -----

import { ref } from "vue";
import { useCookie, useNuxtApp } from '#app'; // Ajout de useRoute

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----

// ------------------

// ------ Const -----
const { $api } = useNuxtApp()
const token = useCookie('token');
// ------------------

// ---- Reactive ----
const startDate = ref<string>("");
const endDate = ref<string>("");
const loading = ref(false);
const error = ref<string | null>(null);
const workedHours = ref<number>(0);
const pauseHours = ref<number>(0);
const contractualHours = ref<number>(0);
const extraHours = ref<number>(0);
// ------------------

// ---- Computed ----

// ------------------

// ------ Hooks -----

// ------------------

// --- Async Func ---
const fetchExtraHours = async () => {
  if (!startDate.value || !endDate.value) {
    error.value = "Veuillez sélectionner les deux dates.";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await $api.post(
      "/time-entries/calculate-hours",
      {
        startDate: startDate.value,
        endDate: endDate.value,
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    const data = response.data;
    workedHours.value = data.workedHours;
    pauseHours.value = data.pauseHours;
    contractualHours.value = data.contractualHours;
    extraHours.value = data.extraHours;
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      error.value = "Vous n'êtes pas autorisé. Vérifiez votre connexion.";
    } else {
      error.value = "Une erreur est survenue lors de la récupération des données.";
    }
    console.error(err);
  } finally {
    loading.value = false;
  }
};


// ------------------

// ---- Function ----

// ------------------

// ------ Watch -----

// ------------------
</script>

<style lang="scss" scoped>
.extra-hours-display {
  background-color: $color-surface;
  color: $color-text-primary;
  padding: $spacing-large;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;

  &__header {
    text-align: center;
    margin-bottom: $spacing-large;
  }

  &__title {
    font-size: $font-size-large-xl;
    margin: 0;
  }

  &__inputs {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-large;

    @media (max-width: $breakpoint-md) {
      flex-direction: column;
    }
  }

  &__label {
    font-size: $font-size-small;
    color: $color-text-secondary;
    margin-bottom: $spacing-small;
  }

  &__input {
    padding: $spacing-small;
    font-size: $font-size-base;
    color: $color-text-primary;
    background-color: $color-background;
    border: 1px solid $color-primary;
    border-radius: $border-radius;

    &:focus {
      outline: none;
      border-color: $color-secondary;
    }
  }

  &__content {
    text-align: center;
  }

  &__loading {
    font-weight: bold;
    color: $color-primary;
  }

  &__results {
    margin-top: $spacing-medium;

    &__result {
      font-size: $font-size-base;
      margin: $spacing-small 0;
    }
  }

  &__error {
    color: $color-danger;
    font-weight: bold;
  }
}
</style>
