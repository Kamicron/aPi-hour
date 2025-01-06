<template>
  <div class="time-entry-summary">
    <h2 class="time-entry-summary__title">Résumé des heures travaillées</h2>
    <div class="time-entry-summary__totals">
      <p class="time-entry-summary__total-line">
        <span class="time-entry-summary__label">Total heures à 25 % :</span>
        <span class="time-entry-summary__value">{{ totalExtra25Hours }} h</span>
      </p>
      <p class="time-entry-summary__total-line">
        <span class="time-entry-summary__label">Total heures à 50 % :</span>
        <span class="time-entry-summary__value">{{ totalExtra50Hours }} h</span>
      </p>
    </div>
    <div class="time-entry-summary__weekly-details">
      <div v-for="week in sortedWeeklyHours" :key="week.weekStart" class="time-entry-summary__week">
        <h3 class="time-entry-summary__week-title">
          Semaine du {{ formatDate(week.weekStart) }} au {{ formatDate(week.weekEnd) }}
        </h3>
        <ul class="time-entry-summary__week-details">
          <li>
            <span class="time-entry-summary__label">Heures travaillées :</span>
            <span class="time-entry-summary__value">{{ week.workedHours }} h</span>
          </li>
          <li>
            <span class="time-entry-summary__label">Heures à 25 % :</span>
            <span class="time-entry-summary__value">{{ week.extra25Hours }} h</span>
          </li>
          <li>
            <span class="time-entry-summary__label">Heures à 50 % :</span>
            <span class="time-entry-summary__value">{{ week.extra50Hours }} h</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useCookie, useNuxtApp } from "#app";

const props = defineProps({
  currentMonth: {
    type: String,
    required: true, // Format attendu : 'YYYY-MM'
  },
});

const { $api } = useNuxtApp();
const token = useCookie("token");
const userId = useCookie("userId");
const weeklyDetails = ref([]);
const totalExtra25Hours = ref(0);
const totalExtra50Hours = ref(0);

const fetchMonthlyHours = async () => {
  try {
    const response = await $api.post(
      "/time-entries/calculate-with-rates",
      { month: props.currentMonth },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );
    weeklyDetails.value = response.data.weeklyDetails;
    totalExtra25Hours.value = response.data.totalExtra25Hours;
    totalExtra50Hours.value = response.data.totalExtra50Hours;
  } catch (error) {
    console.error("Erreur lors du chargement des heures :", error);
  }
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("fr-FR", options);
};

const sortedWeeklyHours = computed(() => {
  return [...weeklyDetails.value].sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));
});

watch(
  () => props.currentMonth,
  () => {
    fetchMonthlyHours();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.time-entry-summary {
  background-color: $color-surface;
  padding: $spacing-large;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;

  &__totals {
    background-color: $color-background;
    padding: $spacing-medium;
    border-radius: $border-radius;
    box-shadow: $box-shadow-light;
    margin-bottom: $spacing-large;

    &__total-line {
      display: flex;
      justify-content: space-between;
      font-family: $font-family-base;
      font-size: $font-size-base;
      color: $color-text-primary;
      margin: $spacing-small 0;

      &__label {
        font-weight: bold;
        color: $color-primary;
      }

      &__value {
        font-weight: bold;
        color: $color-secondary;
      }
    }
  }

  &__weekly-details {
    display: flex;
    flex-direction: column;
    gap: $spacing-large;
  }

  &__week {
    background-color: $color-background;
    margin-bottom: $spacing-large;
    padding: $spacing-medium;
    border-radius: $border-radius;
    box-shadow: $box-shadow-dark;

    &-title {
      font-family: $font-family-base;
      font-size: $font-size-large;
      color: $color-primary;
      margin-bottom: $spacing-medium;
    }

    &-details {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        justify-content: space-between;
        font-family: $font-family-base;
        font-size: $font-size-small;
        color: $color-text-secondary;
        margin-bottom: $spacing-small;

        & .time-entry-summary__label {
          font-weight: bold;
          color: $color-primary-light;
        }

        & .time-entry-summary__value {
          color: $color-secondary;
        }
      }
    }
  }
}
</style>
