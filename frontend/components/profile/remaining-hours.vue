<template>
  <bento-card title="Heures restantes de la semaine" class="remaining-hours">
    <div v-if="error" class="remaining-hours__error">
      {{ error }}
    </div>
    <div v-else-if="!weeklyGoal" class="remaining-hours__error">
      Veuillez configurer votre objectif d'heures hebdomadaires dans votre profil
    </div>
    <div v-else-if="loading" class="remaining-hours__loading">
      <div class="remaining-hours__spinner"></div>
    </div>
    <div v-else class="remaining-hours__content">
      <div class="remaining-hours__value">{{ remainingHours.toFixed(1) }}h</div>
      <div class="remaining-hours__label">restantes cette semaine</div>
      <div class="remaining-hours__progress">
        <div class="remaining-hours__progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      <div class="remaining-hours__details">
        <span>{{ workedHours.toFixed(1) }}h / {{ weeklyGoal }}h</span>
      </div>
    </div>
  </bento-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '~/stores/user';
import { useNuxtApp, useCookie } from '#app';
import { useAxiosError } from '~/composables/useAxiosError';

interface WeeklyDetail {
  weekStart: string;
  weekEnd: string;
  normalHours: number;
  workedHours: number;
  extra25Hours: number;
  extra50Hours: number;
}

interface WorkedHoursResponse {
  data: {
    totalWorkedHours: number;
    totalNormalHours: number;
    totalExtra25Hours: number;
    totalExtra50Hours: number;
    weeklyDetails: WeeklyDetail[];
  }
}

interface ApiInstance {
  get: <T>(url: string, config?: any) => Promise<T>;
}

const { $api } = useNuxtApp();
const api = $api as ApiInstance;
const token = useCookie('token');
const profileStore = useUserStore();
const { getErrorMessage } = useAxiosError();

const error = ref<string | null>(null);
const loading = ref<boolean>(true);
const weeklyDetails = ref<WeeklyDetail[]>([]);

const weeklyGoal = computed(() => profileStore.profile?.weeklyHoursGoal || null);

const currentWeekWorkedHours = computed(() => {
  const now = new Date('2025-03-15T21:42:24+01:00');
  const currentWeek = weeklyDetails.value.find(week => {
    const weekStart = new Date(week.weekStart);
    const weekEnd = new Date(week.weekEnd);
    return now >= weekStart && now <= weekEnd;
  });
  return currentWeek?.workedHours || 0;
});

const workedHours = computed(() => currentWeekWorkedHours.value);

const remainingHours = computed(() => {
  if (!weeklyGoal.value) return 0;
  return Math.max(0, weeklyGoal.value - workedHours.value);
});

const progressPercentage = computed(() => {
  if (!weeklyGoal.value) return 0;
  return Math.min(100, (workedHours.value / weeklyGoal.value) * 100);
});

async function fetchWorkedHours() {
  try {
    error.value = null;
    loading.value = true;

    const now = new Date();

    const date = now.toISOString().slice(0, 7);

    const response = await $api.post(
      "/time-entries/calculate-with-rates",
      { month: date },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );

    weeklyDetails.value = response.data.weeklyDetails;
    console.log('❤',weeklyDetails.value);
  } catch (err) {
    error.value = getErrorMessage(err);
    weeklyDetails.value = [];
  } finally {
    loading.value = false;
  }
}


onMounted(fetchWorkedHours);
</script>

<style lang="scss" scoped>
.remaining-hours {
  &__error {
    padding: $spacing-medium;
    color: $color-danger;
    text-align: center;
  }

  &__loading {
    padding: $spacing-medium;
    text-align: center;
  }

  &__spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto;
    border: 3px solid $color-background;
    border-top: 3px solid $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__content {
    padding: $spacing-medium;
    text-align: center;
  }

  &__value {
    font-size: 2.5rem;
    font-weight: bold;
    color: $color-primary;
    margin-bottom: $spacing-small;
  }

  &__label {
    color: $color-text-secondary;
    margin-bottom: $spacing-medium;
  }

  &__progress {
    width: 100%;
    height: 8px;
    background-color: $color-background;
    border-radius: $border-radius;
    margin-bottom: $spacing-small;
    overflow: hidden;
  }

  &__progress-bar {
    height: 100%;
    background-color: $color-primary;
    border-radius: $border-radius;
    transition: width 0.3s ease;
  }

  &__details {
    font-size: $font-size-small;
    color: $color-text-secondary;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
