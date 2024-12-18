<template>
  <div class="work-sessions">
    <h2 class="work-sessions__title">Résumé de la journée</h2>

    <!-- Sélecteur de date -->
    <!-- <input v-model="selectedDate" type="date" @change="fetchSessions" class="work-sessions__date-picker" /> -->
    <calendar @pick-date="handleDatePicked" />

    <!-- Résumé total -->
    <div v-if="summary" class="work-sessions__summary">
      <p>Total de travail : {{ formatTime(summary.totalWorkTime) }}</p>
      <p>Total de pause : {{ formatTime(summary.totalPauseTime) }}</p>
    </div>

    <!-- Détails par étape -->
    <div v-if="summary && summary.details.length" class="work-sessions__details">
      <h3>Détails des sessions :</h3>
      <ul>
        <li v-for="detail in summary.details" :key="detail.sessionId">
          <strong>Session :</strong> {{ detail.sessionId }}<br />
          Début : {{ formatDate(detail.startTime) }}<br />
          Fin : {{ formatDate(detail.endTime) }}<br />
          Temps de travail : {{ formatTime(detail.workTime) }}<br />
          Temps de pause : {{ formatTime(detail.pauseTime) }}
        </li>
      </ul>
    </div>

    <!-- Aucune session trouvée -->
    <div v-else>
      <p>Aucune session trouvée pour cette date.</p>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useNuxtApp, useCookie } from '#app';

const { $api } = useNuxtApp();
const token = useCookie('token');

// Variables réactives
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const summary = ref<any | null>(null);

// Méthode pour récupérer les sessions par date
async function fetchSessions() {
  try {
    const response = await $api.get(`/time-entries/date/${selectedDate.value}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    summary.value = response.data;
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

// Récupérer les sessions au montage
fetchSessions();
</script>

<style lang="scss" scoped>
.work-sessions {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &__title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  &__date-picker {
    margin-bottom: 1rem;
    padding: 0.5rem;
    font-size: 1rem;
  }

  &__summary {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;

    p {
      margin: 0.5rem 0;
    }
  }

  &__details {
    ul {
      list-style: none;
      padding: 0;

      li {
        background: #fff;
        margin: 0.5rem 0;
        padding: 1rem;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
