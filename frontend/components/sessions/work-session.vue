<template>
  <div class="work-sessions">
    <div v-if="profileStore.profile" class="work-sessions__layout">
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

        <button class="btn" @click="isCreateSessionModal = true">
          <i class="fa-solid fa-plus"></i> Ajouter une session
        </button>

        <!-- Détails par étape -->
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

        <!-- Aucune session trouvée -->
        <section v-else class="work-sessions__no-data">
          <p>Aucune session trouvée pour cette date.</p>
        </section>
      </div>

      <div class="work-sessions__content--column">
        <div>
          <extra-hours-display />
        </div>

        <div>
          <set_vacation />
        </div>
      </div>

    </div>
    <div v-else>
      Veuillez vous connecter
    </div>
  </div>

  <modal v-model="isCreateSessionModal">
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useNuxtApp, useCookie } from '#app';
import { useUserStore } from '../../stores/user';

const { $api } = useNuxtApp();
const token = useCookie('token');
const profileStore = useUserStore();

console.log('profileStore', profileStore);


// Variables réactives
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const summary = ref<any | null>(null);
const isCreateSessionModal = ref<boolean>(false)


//TODO: ATTENTION DONNE NON VARIALBE
// Calcul dynamique de l'objectif quotidien en fonction du profil
const userProfile = ref({ weeklyHoursGoal: 35, workingDaysPerWeek: 5 }); // Exemple de profil utilisateur
const dailyWorkGoal = computed(() => {
  if (!userProfile.value) return 0;
  return (userProfile.value.weeklyHoursGoal / userProfile.value.workingDaysPerWeek) * 3600; // En secondes
});

const showCreateSessionForm = ref(false);

const newSession = ref({
  startTime: '',
  endTime: '',
});

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

    // Réinitialiser le formulaire et cacher le formulaire
    newSession.value.startTime = '';
    newSession.value.endTime = '';
    showCreateSessionForm.value = false;

    // Rafraîchir les sessions
    fetchSessions();

    alert('Session créée avec succès.');
  } catch (error) {
    console.error('Erreur lors de la création de la session :', error);
    alert('Une erreur est survenue lors de la création de la session.');
  }
}

function cancelCreateSession() {
  showCreateSessionForm.value = false;
  newSession.value.startTime = '';
  newSession.value.endTime = '';
}



watch(
  () => dailyWorkGoal.value,
  (newValue) => {
    console.log('newValue:', newValue);
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

async function addSession() {
  try {
    // Préparation des données pour la nouvelle session
    const payload = {
      startTime: new Date(selectedDate.value).toISOString(), // Début de la session (minuit par défaut)
    };

    // Requête API pour créer la session
    const response = await $api.post('/time-entries', payload, {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    alert('Session ajoutée avec succès.');
    fetchSessions(); // Rafraîchit la liste des sessions après l'ajout
  } catch (error) {
    console.error('Erreur lors de l’ajout de la session :', error);
    alert('Une erreur est survenue lors de l’ajout de la session.');
  }
}

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

  &__content--column {
    display: flex;
    flex-direction: column;
    gap: $spacing-large;
  }

  &__summary {
    margin-bottom: $spacing-large;
    flex-shrink: 0;

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
