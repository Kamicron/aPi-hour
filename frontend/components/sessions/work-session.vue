<template>
  <div class="work-sessions">
    <div class="work-sessions__layout">
      <!-- Colonne gauche : Calendrier -->
      <div class="work-sessions__calendar-column">
        <header class="work-sessions__header">
          <h2 class="work-sessions__title">Résumé de la journée</h2>
          <calendar @pick-date="handleDatePicked" class="work-sessions__calendar" />
        </header>
      </div>

      <!-- Colonne droite : Résumé et détails -->
      <div class="work-sessions__content-column">
        <!-- Résumé total -->
        <section v-if="summary" class="work-sessions__summary">
          <div class="work-sessions__summary-item">
            <span class="work-sessions__label">Total de travail :</span>
            <span class="work-sessions__value">{{ formatTime(summary.totalWorkTime) }}</span>
          </div>
          <div class="work-sessions__summary-item">
            <span class="work-sessions__label">Total de pause :</span>
            <span class="work-sessions__value">{{ formatTime(summary.totalPauseTime) }}</span>
          </div>
          <div class="work-sessions__summary-item">
            <span class="work-sessions__label">Heures supplémentaires :</span>
            <span :class="['work-sessions__value', { 'is-positive': overtime > 0, 'is-negative': overtime <= 0 }]">
              {{ formatOvertime(overtime) }}
            </span>
          </div>
        </section>

        <!-- Détails par étape -->
        <section v-if="summary && summary.details.length" class="work-sessions__details">
          <h3 class="work-sessions__details-title">Détails des sessions :</h3>
          <ul class="work-sessions__list">
            <li v-for="detail in summary.details" :key="detail.sessionId" class="work-sessions__card">
              <single-session 
                :sessionId="detail.sessionId" 
                :start-time="formatDate(detail.startTime)" 
                :end-time="formatDate(detail.endTime)"
                :work-time="formatTime(detail.workTime)" 
                :pause-time="formatTime(detail.pauseTime)" />
            </li>
          </ul>
        </section>

        <!-- Aucune session trouvée -->
        <section v-else class="work-sessions__no-data">
          <p>Aucune session trouvée pour cette date.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNuxtApp, useCookie } from '#app';

const { $api } = useNuxtApp();
const token = useCookie('token');

// Variables réactives
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const summary = ref<any | null>(null);

// Calcul dynamique de l'objectif quotidien en fonction du profil
const userProfile = ref({ weeklyHoursGoal: 35, workingDaysPerWeek: 5 }); // Exemple de profil utilisateur
const dailyWorkGoal = computed(() => {
  if (!userProfile.value) return 0;
  return (userProfile.value.weeklyHoursGoal / userProfile.value.workingDaysPerWeek) * 3600; // En secondes
});

watch(
  () => dailyWorkGoal.value,
  (newValue) => {
    console.log('newValue:',newValue );
  }
);

// Calcul des heures supplémentaires ou manquantes
const overtime = computed(() => {
  if (!summary.value) return 0;
  return summary.value.totalWorkTime - dailyWorkGoal.value;
});

// Méthode pour récupérer les sessions par date
async function fetchSessions() {
  try {
    const response = await $api.get(`/time-entries/date/${selectedDate.value}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    summary.value = response.data;

    console.log('summary', summary);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions', error);
  }
}

function handleDatePicked(date: Date) {
  selectedDate.value = date.toISOString().slice(0, 10);
  fetchSessions();
}

// Formater les secondes en HH:MM:SS
function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Formater une date
function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleString();
}

// Formater les heures supplémentaires
function formatOvertime(seconds: number) {
  const prefix = seconds > 0 ? '+' : '';
  return `${prefix}${formatTime(Math.abs(seconds))}`;
}

// Récupérer les sessions au montage
fetchSessions();
</script>

<style lang="scss" scoped>
.work-sessions {
  font-family: $font-family-base;
  background-color: $color-background;
  color: $color-text-primary;
  padding: $spacing-large;
  border-radius: $border-radius;
  box-shadow: $box-shadow-dark;

  &__layout {
    display: flex;
    flex-direction: row;
    gap: $spacing-large;
  }

  &__calendar-column {
    flex: 1;
    background-color: $color-surface;
    padding: $spacing-large;
    border-radius: $border-radius;
    box-shadow: $box-shadow-light;
  }

  &__content-column {
    flex: 2;
    background-color: $color-surface;
    padding: $spacing-large;
    border-radius: $border-radius;
    box-shadow: $box-shadow-light;
    display: flex;
    flex-direction: column;
    max-height: 600px;
    overflow: hidden;
  }

  &__summary {
    margin-bottom: $spacing-large;
    flex-shrink: 0;

    &-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: $spacing-medium;
      padding: $spacing-small;
      background-color: $color-background;
      border-radius: $border-radius;
    }

    .is-positive {
      color: $color-success;
      font-weight: bold;
    }

    .is-negative {
      color: $color-danger;
      font-weight: bold;
    }
  }

  &__details {
    flex: 1;
    overflow-y: auto;

    &-title {
      font-size: $font-size-base;
      margin-bottom: $spacing-medium;
    }

    &__list {
      list-style: none;
      padding: 0;

      &-item {
        margin-bottom: $spacing-medium;

        .work-sessions__card {
          background-color: $color-surface;
          border-radius: $border-radius;
          box-shadow: $box-shadow-light;
          padding: $spacing-medium;
          transition: transform 0.2s ease, box-shadow 0.2s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          }

          &-content {
            display: flex;
            flex-direction: column;
          }

          &-header {
            border-bottom: 1px solid $color-text-secondary;
            margin-bottom: $spacing-medium;
            padding-bottom: $spacing-small;
          }

          &-title {
            font-size: $font-size-large;
            font-weight: bold;
          }

          &-body p {
            margin: $spacing-small 0;
          }
        }
      }
    }
  }

  &__no-data {
    text-align: center;
    margin-top: $spacing-large;
    font-size: $font-size-base;
    color: $color-warning;
  }
}

@media screen and (max-width: $breakpoint-lg) {
  .work-sessions {
    &__layout {
      flex-direction: column;
    }
  }
}
</style>
