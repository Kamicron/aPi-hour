<template>
  <div class="work-sessions__content-column">
    <section v-if="summary" class="work-sessions__summary">
      <h2 class="work-sessions__summary--title">Résumé de la journée</h2>

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

    <button class="btn" @click="isCreateSessionModal = true">
      <i class="fa-solid fa-plus"></i> Ajouter une session
    </button>

    <section v-if="summary && summary.details.length" class="work-sessions__details">
      <h3 class="work-sessions__details-title">Détails des sessions :</h3>
      <ul class="work-sessions__list">
        <li v-for="detail in summary.details" :key="detail.sessionId" class="work-sessions__card">
          <single-session :sessionId="detail.sessionId" :start-time="formatDate(detail.startTime)"
            :end-time="formatDate(detail.endTime)" :work-time="formatTime(detail.workTime)"
            :pause-time="formatTime(detail.pauseTime)" />
        </li>
      </ul>
    </section>

    <section v-else class="work-sessions__no-data">
      <p>Aucune session trouvée pour cette date.</p>
    </section>

    <modal v-model="isCreateSessionModal" title="Ajouter une session">
      <form @submit.prevent="createSession" class="work-sessions__create-session-form">
        <div>
          <label for="startTime" class="form__label">Début :</label>
          <input type="datetime-local" id="startTime" v-model="newSession.startTime" class="pi-input" required />
        </div>
        <div>
          <label for="endTime" class="form__label">Fin :</label>
          <input type="datetime-local" id="endTime" v-model="newSession.endTime" class="pi-input" />
        </div>
        <div class="work-sessions__create-session-actions">
          <button type="submit" class="btn btn--primary">
            <i class="fa-solid fa-check"></i> Enregistrer
          </button>
          <button type="button" class="btn btn--secondary" @click="cancelCreateSession">
            <i class="fa-solid fa-xmark"></i> Annuler
          </button>
        </div>
      </form>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useNuxtApp, useCookie } from '#app';
import { EGlobalEvent } from '~/assets/ts/enums/global/globalEvent.enum';
import { useGlobalEvents } from '~/composable/useGlobalEvent';
import { useUserStore } from '../../stores/user';

const props = defineProps({
  selectedDate: String,
});

const { $api } = useNuxtApp();
const token = useCookie('token');
const profileStore = useUserStore();

// Variables réactives
const summary = ref<any | null>(null);
const isCreateSessionModal = ref(false);
const newSession = ref({
  startTime: '',
  endTime: '',
});

useGlobalEvents().subscribeTo<boolean | undefined>(EGlobalEvent.UPDATE_DAY, () => {
  console.log('Event UPDATE_DAY reçu')
  console.log('selectedDate:', props.selectedDate)
  fetchSessions()
});

// Exemple de profil utilisateur (peut être remplacé par une prop si nécessaire)
// Calcul dynamique de l'objectif quotidien en fonction du profil
const userProfile = computed(() => {
  if (!profileStore.profile) {
    return { weeklyHoursGoal: 35, workingDaysPerWeek: 5 }; // Valeurs par défaut si le profil n'est pas encore chargé
  }

  console.log('profileStore.profile.workingDaysPerWeek', profileStore.profile.workingDaysPerWeek)
  return {
    weeklyHoursGoal: profileStore.profile.weeklyHoursGoal || 35,
    workingDaysPerWeek: profileStore.profile.workingDaysPerWeek || 5,
  };
});

const dailyWorkGoal = computed(() => {
  if (!userProfile.value) return 0;
  console.log('userProfile', userProfile.value);
  return (userProfile.value.weeklyHoursGoal / userProfile.value.workingDaysPerWeek) * 3600; // En secondes
});

// Calcul des heures supplémentaires ou manquantes
const overtime = computed(() => {
  if (!summary.value) return 0;
  return summary.value.totalWorkTime - dailyWorkGoal.value;
});

// Récupérer les sessions par date
async function fetchSessions() {
  try {
    const response = await $api.get(`/time-entries/date/${props.selectedDate}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    summary.value = response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions', error);
  }
}

// Créer une nouvelle session
async function createSession() {
  if (!newSession.value.startTime) {
    alert('Veuillez renseigner une date de début pour créer une session.');
    return;
  }

  try {
    const payload = {
      startTime: newSession.value.startTime,
      endTime: newSession.value.endTime || null, // Fin facultative
    };

    await $api.post('/time-entries', payload, {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    // Réinitialiser le formulaire et masquer la modal
    newSession.value.startTime = '';
    newSession.value.endTime = '';
    isCreateSessionModal.value = false;
    useGlobalEvents().emitEvent(EGlobalEvent.UPDATE_CALENDAR);

    // Rafraîchir les sessions
    fetchSessions();
  } catch (error) {
    console.error('Erreur lors de la création de la session :', error);
    alert('Une erreur est survenue lors de la création de la session.');
  }
}

function cancelCreateSession() {
  isCreateSessionModal.value = false;
  newSession.value.startTime = '';
  newSession.value.endTime = '';
}

// Récupérer les sessions lorsque la date change
watch(() => props.selectedDate, fetchSessions);

// Charger les données initiales
fetchSessions();

// Formatage des données
function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleString();
}

function formatOvertime(seconds: number) {
  const prefix = seconds > 0 ? '+' : '';
  return `${prefix}${formatTime(Math.abs(seconds))}`;
}
</script>

<style lang="scss" scoped>
.work-sessions {
  font-family: $font-family-base;
  background-color: $color-background;
  color: $color-text-primary;
  padding: $spacing-large;
  border-radius: $border-radius;
  height: 100%;
  max-height: 100%;
  overflow-y: auto; /* Active un défilement vertical si nécessaire */

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
    box-shadow: $box-shadow-dark;

  }

  &__content-column {
    flex: 2;
    background-color: $color-surface;
    padding: $spacing-large;
    border-radius: $border-radius;
    box-shadow: $box-shadow-light;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__content--column {
    display: flex;
    flex-direction: column;
    gap: $spacing-large;
  }

  &__summary {
    margin-bottom: $spacing-large;
    flex-shrink: 0;

    &--title {
      margin-bottom: $spacing-large;
    }

    &-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: $spacing-medium;
      padding: $spacing-small $spacing-medium;
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

.work-sessions__create-session-form {
  margin-top: $spacing-large;
  display: flex;
  flex-direction: column;
  gap: $spacing-medium;

  .form__label {
    font-size: $font-size-small;
    color: $color-text-secondary;
  }

  .form__input {
    padding: $spacing-small;
    border: 1px solid $color-primary-light;
    border-radius: $border-radius;
    background-color: $color-background;
    color: $color-text-primary;
    font-size: $font-size-small;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  .work-sessions__create-session-actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-medium;
  }

  .btn--primary {
    background-color: $color-primary;
    color: $color-text-secondary;

    &:hover {
      background-color: darken($color-primary, 10%);
    }
  }

  .btn--secondary {
    background-color: $color-warning;
    color: $color-text-secondary;

    &:hover {
      background-color: darken($color-warning, 10%);
    }
  }
}


</style>
