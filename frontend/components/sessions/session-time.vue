<template>
  <div class="time-session">
    <!-- État de repos -->
    <div v-if="!sessionStore.isRunning" class="time-session__idle">
      <button @click="start" class="time-session__button">Démarrer</button>
    </div>

    <!-- État en cours -->
    <div v-else-if="sessionStore.isRunning && !sessionStore.isPaused" class="time-session__running">
      <p>Session en cours...</p>
      <button @click="pause" class="time-session__button">Pause</button>
      <button @click="stop" class="time-session__button time-session__button--stop">Stop</button>
    </div>

    <!-- État en pause -->
    <div v-else class="time-session__paused">
      <p>Session en pause...</p>
      <button @click="resume" class="time-session__button">Reprendre</button>
      <button @click="stop" class="time-session__button time-session__button--stop">Stop</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// ----- Import -----
import { useSessionStore } from '../../stores/session';
import { useNuxtApp, useCookie } from '#app';

const sessionStore = useSessionStore();
const { $api } = useNuxtApp();
const token = useCookie('token');

// ----- Functions -----
async function start() {
  try {
    const response = await $api.post('/time-entries/start', {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    });

    // Supposons que la réponse contient { id: 'session-id' }
    const sessionIdFromApi = response.data.id;
    if (sessionIdFromApi) {
      sessionStore.sessionId = sessionIdFromApi;
      sessionStore.startSession();
    } else {
      throw new Error('ID de session non reçu du serveur');
    }
  } catch (err) {
    console.error('Erreur lors du démarrage de la session', err);
  }
}


async function pause() {
  try {
    await $api.patch(`/pauses/${sessionStore.sessionId}/start`, {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    sessionStore.pauseSession();
  } catch (err) {
    console.error('Erreur lors de la mise en pause', err);
  }
}

async function resume() {
  try {
    await $api.patch(`/pauses/${sessionStore.sessionId}/resume`, {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    sessionStore.resumeSession();
  } catch (err) {
    console.error('Erreur lors de la reprise de la session', err);
  }
}

async function stop() {
  try {
    await $api.patch(`/time-entries/${sessionStore.sessionId}/end`, {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    sessionStore.stopSession();
  } catch (err) {
    console.error('Erreur lors de l\'arrêt de la session', err);
  }
}
</script>
