<template>
  <div class="extra-hours-display">
    <div class="extra-hours-display__ultra-small">
      <button class="btn" @click="toggleDisplayView = true">
        <i class="fa-solid fa-clock"></i>
      </button>
    </div>

    <div class="extra-hours-display__small">
      <h2>Heures supp.</h2>
      <div class="extra-hours-display__content">
        <div v-if="loading" class="extra-hours-display__loading">
          <pi-loader />
        </div>
        <div v-if="!loading && !error" class="extra-hours-display__table">
          <div class="extra-hours-display__row">
            <span class="extra-hours-display__cell">Total</span>
            <span
              class="extra-hours-display__cell"
              :class="{
                'extra-hours-display__positive': extraHours >= 0,
                'extra-hours-display__negative': extraHours < 0,
              }"
            >
              {{ extraHours.toFixed(2) }} h
            </span>
          </div>
        </div>
        <div v-if="error" class="extra-hours-display__error">{{ error }}</div>
      </div>
    </div>

    <div class="extra-hours-display__large">
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
            <span
              class="extra-hours-display__cell"
              :class="{
                'extra-hours-display__positive': extraHours >= 0,
                'extra-hours-display__negative': extraHours < 0,
              }"
            >
              {{ extraHours.toFixed(2) }} h
            </span>
          </div>
        </div>
        <div v-if="error" class="extra-hours-display__error">{{ error }}</div>
      </div>
    </div>
  </div>

  <modal v-model="toggleDisplayView" title="Heures supplémentaires">
    <div class="extra-hours-display__modal">
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
            <span
              class="extra-hours-display__cell"
              :class="{
                'extra-hours-display__positive': extraHours >= 0,
                'extra-hours-display__negative': extraHours < 0,
              }"
            >
              {{ extraHours.toFixed(2) }} h
            </span>
          </div>
        </div>
        <div v-if="error" class="extra-hours-display__error">{{ error }}</div>
      </div>
    </div>
  </modal>
</template>

<script setup lang="ts">
// ----- Import -----
import { ref } from "vue";
import { useCookie, useNuxtApp } from "#app";
// ------------------

// ------ Const ----- 
const { $api } = useNuxtApp();
const token = useCookie("token");
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
const toggleDisplayView = ref<boolean>(false);
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
  color: $color-text-primary;
  width: 100%;
  height: inherit !important;
  box-sizing: border-box;
  position: relative;
  container-type: size;
  container-name: extra-hours-display;

  h2 {
    text-align: center;
    margin-bottom: $spacing-medium;
  }

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
  }

  &__positive {
    color: $color-success;
  }

  &__negative {
    color: $color-danger;
  }

  &__error {
    color: $color-danger;
    font-weight: bold;
    font-size: $font-size-base;
    margin-top: $spacing-medium;
  }

  // États par défaut
  &__ultra-small {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  &__small {
    display: none;
  }

  &__large {
    display: none;
  }

  // Règles de container
  @container extra-hours-display ((min-height: 70px) and (max-height: 245px)) and (min-width: 200px) {
    .extra-hours-display {
      padding: 0;
    }

    .extra-hours-display__ultra-small {
      display: none;
    }

    .extra-hours-display__small {
      display: block;
    }
  }

  @container extra-hours-display (min-height: 245px) and (min-width: 300px) {
    .extra-hours-display__large {
      display: block;
    }

    .extra-hours-display__small {
      display: none;
    }

    .extra-hours-display__ultra-small {
      display: none;
    }
  }
}

// Style pour la modale
.extra-hours-display__modal {
  padding: $spacing-large;

  h2 {
    margin-bottom: $spacing-large;
  }
}
</style>
