<template>
  <div class="extra-hours-display">
    <div class="extra-hours-display__header">
      <h1 class="extra-hours-display__title">Calcul des Heures Supplémentaires</h1>
    </div>
    <div class="extra-hours-display__inputs">
      <label class="extra-hours-display__label">
        Date de début :
        <input type="date" v-model="startDate" @change="fetchExtraHours" class="pi-input" />
      </label>
      <label class="extra-hours-display__label">
        Date de fin :
        <input type="date" v-model="endDate" @change="fetchExtraHours" class="pi-input" />
      </label>
    </div>

    <div class="extra-hours-display__content">
      <div v-if="loading" class="extra-hours-display__loading">Chargement...</div>
      <div v-if="!loading && !error" class="extra-hours-display__results">
        <p class="extra-hours-display__result">
          <strong>Heures Travaillées :</strong> {{ workedHours.toFixed(2) }} h
        </p>
        <p class="extra-hours-display__result">
          <strong>Heures de Pause :</strong> {{ pauseHours.toFixed(2) }} h
        </p>
        <p class="extra-hours-display__result">
          <strong>Heures Contractuelles :</strong> {{ contractualHours.toFixed(2) }} h
        </p>
        <p class="extra-hours-display__result">
          <strong>Heures Supplémentaires :</strong> <span :class="{'extra-hours-display__positive': extraHours >= 0, 'extra-hours-display__negative': extraHours < 0}">{{ extraHours.toFixed(2) }} h</span>
        </p>
      </div>
      <div v-if="error" class="extra-hours-display__error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ----- Import -----
import { ref } from "vue";
import { useCookie, useNuxtApp } from '#app';
// ------------------

// ------ Const ------
const { $api } = useNuxtApp();
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
</script>

<style lang="scss" scoped>
.extra-hours-display {
  background-color: $color-surface;
  color: $color-text-primary;
  padding: $spacing-large;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;
  max-width: 700px;
  margin: 0 auto;

  &__header {
    text-align: center;
    margin-bottom: $spacing-large;
  }

  &__title {
    font-size: $font-size-large-xl;
    font-weight: bold;
    color: $color-primary;
    margin: 0;
  }

  &__inputs {
    display: flex;
    justify-content: space-between;
    gap: $spacing-medium;
    margin-bottom: $spacing-large;

    @media (max-width: $breakpoint-md) {
      flex-direction: column;
    }
  }

  &__label {
    font-size: $font-size-small;
    color: $color-text-secondary;
  }

  &__input {
    width: 100%;
    padding: $spacing-small;
    font-size: $font-size-base;
    color: $color-text-primary;
    background-color: $color-surface;
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
    font-size: $font-size-base;
    font-weight: bold;
    color: $color-primary;
  }

  &__results {
    margin-top: $spacing-medium;

    &__result {
      font-size: $font-size-base;
      margin: $spacing-small 0;
      color: $color-text-primary;
    }

    .extra-hours-display__positive {
      color: $color-success;
    }

    .extra-hours-display__negative {
      color: $color-danger;
    }
  }

  &__error {
    color: $color-danger;
    font-weight: bold;
    font-size: $font-size-base;
  }
}
</style>
