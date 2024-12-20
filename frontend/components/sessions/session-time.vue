<template>
  <div v-if="profile" class="time-session">
    <div v-if="profile.sessions.length === 0" class="time-session__idle">
      <button @click="start" class="time-session__button">Démarrer</button>
    </div>
    <div v-else>
      <div v-if="profile.sessions[0].status === 'started'" class="time-session__running">
        <p>Session en cours...</p>
        <button @click="pause" class="time-session__button">Pause</button>
        <button @click="stop" class="time-session__button time-session__button--stop">Stop</button>
      </div>

      <div v-if="profile.sessions[0].status === 'paused'">
        <p>Session en pause...</p>
        <button @click="resume" class="time-session__button">Reprendre</button>
        <button @click="stop" class="time-session__button time-session__button--stop">Stop</button>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">


// ----- Import -----
import { useSessionStore } from '../../stores/session';
import { useNuxtApp, useCookie } from '#app';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();

const sessionStore = useSessionStore();
const { $api } = useNuxtApp();
const token = useCookie('token');
const profile = ref()

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
      getProfile()
    } else {
      throw new Error('ID de session non reçu du serveur');
    }
  } catch (err) {
    console.error('Erreur lors du démarrage de la session', err);
  }
}

onMounted(() => { getProfile() })

async function getProfile() {
  profile.value = await userStore.fetchProfile($api);
}


async function pause() {
  try {
    console.log('profile', profile);

    await $api.patch(`/pauses/${profile.value.sessions[0].timeEntry.id}/start`, {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    sessionStore.pauseSession();
    getProfile()
  } catch (err) {
    console.error('Erreur lors de la mise en pause', err);
  }
}

async function resume() {
  try {
    await $api.patch(`/pauses/${profile.value.sessions[0].timeEntry.id}/resume`, {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    sessionStore.resumeSession();
    getProfile()
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
    getProfile()
  } catch (err) {
    console.error('Erreur lors de l\'arrêt de la session', err);
  }
}
</script>
