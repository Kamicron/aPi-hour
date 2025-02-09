<template>
  <bento-card title="Résumé des heures travaillées">
    <div class="time-entry-summary">
      <div class="time-entry-summary__totals">
        <p class="time-entry-summary__total-line">
          <span class="time-entry-summary__label">Total heures à 25 % :</span>
          <span class="time-entry-summary__value">{{ roundNumber(totalExtra25Hours) }} h</span>
        </p>
        <p class="time-entry-summary__total-line">
          <span class="time-entry-summary__label">Total heures à 50 % :</span>
          <span class="time-entry-summary__value">{{ roundNumber(totalExtra50Hours) }} h</span>
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
              <span class="time-entry-summary__value">{{ roundNumber(week.workedHours) }} h</span>
            </li>
            <li>
              <span class="time-entry-summary__label">Heures à 25 % :</span>
              <span class="time-entry-summary__value">{{ roundNumber(week.extra25Hours) }} h</span>
            </li>
            <li>
              <span class="time-entry-summary__label">Heures à 50 % :</span>
              <span class="time-entry-summary__value">{{ roundNumber(week.extra50Hours) }} h</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </bento-card>
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
const weeklyDetails = ref([]);
const totalExtra25Hours = ref(0);
const totalExtra50Hours = ref(0);

const roundNumber = (value: number) => {
  return Number(Math.round(value * 100) / 100).toFixed(2);
};

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
  { deep: true }
);
</script>

<style lang="scss" scoped>
.time-entry-summary {
  &__totals {
    background-color: $color-background;
    padding: $spacing-medium;
    border-radius: $border-radius;
    margin-bottom: $spacing-large;
  }

  &__total-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-small;
    margin: $spacing-small 0;

    .time-entry-summary__label {
      font-weight: bold;
      color: $color-primary;
    }

    .time-entry-summary__value {
      font-weight: bold;
      color: $color-secondary;
      min-width: 80px;
      text-align: right;
    }
  }

  &__weekly-details {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: $spacing-large;
  }

  &__week {
    background-color: $color-background;
    padding: $spacing-medium;
    border-radius: $border-radius;
    box-shadow: $box-shadow-dark;

    &-title {
      font-family: $font-family-base;
      font-size: $font-size-base;
      color: $color-primary;
      margin-bottom: $spacing-medium;
      text-align: center;
      padding-bottom: $spacing-small;
      border-bottom: 2px solid $color-primary-light;
    }

    &-details {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: $font-family-base;
        font-size: $font-size-small;
        color: $color-text-secondary;
        padding: $spacing-small 0;
        border-bottom: 1px solid $color-text-secondary;

        &:last-child {
          border-bottom: none;
        }

        & .time-entry-summary__label {
          font-weight: bold;
          color: $color-primary-light;
        }

        & .time-entry-summary__value {
          color: $color-secondary;
          min-width: 60px;
          text-align: right;
        }
      }
    }
  }
}

@media (max-width: $breakpoint-md) {
  .time-entry-summary {
    &__weekly-details {
      grid-template-columns: 1fr;
    }
  }
}
</style>
