<template>
  <div class="extra-hours-display">
    <div class="extra-hours-display__header">
      <h2>Calcul des heures supplémentaires</h2>
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
      <div v-if="loading" class="extra-hours-display__loading">
        <pi-loader />
      </div>
      <div v-if="!loading && !error" class="extra-hours-display__table">
        <div class="extra-hours-display__row">
          <span class="extra-hours-display__cell">Heures Travaillées</span>
          <span class="extra-hours-display__cell">{{ workedHours.toFixed(2) }} h</span>
        </div>
        <div class="extra-hours-display__row">
          <span class="extra-hours-display__cell">Heures de Pause</span>
          <span class="extra-hours-display__cell">{{ pauseHours.toFixed(2) }} h</span>
        </div>
        <div class="extra-hours-display__row">
          <span class="extra-hours-display__cell">Heures Contractuelles</span>
          <span class="extra-hours-display__cell">{{ contractualHours.toFixed(2) }} h</span>
        </div>
        <div class="extra-hours-display__row">
          <span class="extra-hours-display__cell">Heures Supplémentaires</span>
          <span class="extra-hours-display__cell" :class="{
            'extra-hours-display__positive': extraHours >= 0,
            'extra-hours-display__negative': extraHours < 0,
          }">
            {{ extraHours.toFixed(2) }} h
          </span>
        </div>
      </div>
      <div v-if="error" class="extra-hours-display__error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ----- Import -----
import { ref } from "vue";
import { useCookie, useNuxtApp } from "#app";
import { EToast } from '~/assets/ts/enums/toast.enum'
import { useAxiosError } from '~/composables/useAxiosError'
// ------------------

// ------ Const ----- 
const { $api } = useNuxtApp();
const token = useCookie("token");
const { $toast } = useNuxtApp()
const { getErrorMessage } = useAxiosError()
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

    $toast.show({
      message: 'Donnée récupérée avec succès.',
      type: EToast.SUCCESS,
      duration: 3000
    })
  } catch (error: any) {
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    })
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
  width: 100%;

  &__header {
    text-align: center;
    margin-bottom: $spacing-large;
  }

  &__inputs {
    display: flex;
    gap: $spacing-medium;
    margin-bottom: $spacing-medium;

    label {
      flex: 1;
    }

    .pi-input {
      width: 100%;
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

  &__table {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-small;
  }

  &__row {
    display: contents;
  }

  &__cell {
    padding: $spacing-small $spacing-medium;
    text-align: left;
    border-bottom: 1px solid $color-text-secondary;

    &:nth-child(2) {
      text-align: right;
      font-weight: bold;
    }

    &.extra-hours-display__positive {
      color: $color-success;
    }

    &.extra-hours-display__negative {
      color: $color-danger;
    }
  }

  &__error {
    color: $color-danger;
    font-weight: bold;
    font-size: $font-size-base;
    margin-top: $spacing-medium;
  }
}

@media (max-width: 768px) {
  .extra-hours-display {
    padding: $spacing-medium;

    &__header {
      margin-bottom: $spacing-medium;
    }

    &__inputs {
      flex-direction: column;
      gap: $spacing-small;

      label {
        display: flex;
        flex-direction: column;
        gap: $spacing-small;
      }
    }

    &__table {
      display: flex;
      flex-direction: column;
      gap: $spacing-small;
    }

    &__row {
      display: flex;
      justify-content: space-between;
      padding: $spacing-small 0;
      border-bottom: 1px solid $color-text-secondary;
    }

    &__cell {
      padding: 0;
      border: none;

      &:nth-child(2) {
        text-align: right;
      }
    }
  }
}
</style>
