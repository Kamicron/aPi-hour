<template>
  <div v-if="profile && isLogged" class="time-session">
    <div v-if="profile.sessions.length === 0" class="time-session__idle">
      <div class="time-session__card">
      <button @click="start" class="btn">Démarrer</button>
    </div>
    </div>
    <div v-else>
      <div v-if="profile.sessions[0].status === 'started'" class="time-session__running">
        <div class="time-session__card">
          <h4 class="time-session__title">Session en cours...</h4>
          <p><strong>Heure de début :</strong> {{ startTime }}</p>
          <p><strong>Temps écoulé :</strong> {{ formattedElapsedTime }}</p>
          <div class="time-session__actions">
            <button @click="pause" class="btn --pause">Pause</button>
            <button @click="stop" class="btn --stop">Stop</button>
          </div>
        </div>
      </div>

      <div v-if="profile.sessions[0].status === 'paused'" class="time-session__paused">
        <div class="time-session__card">
          <h4 class="time-session__title">Session en pause...</h4>
          <div class="time-session__actions">
            <button @click="resume" class="btn --resume">Reprendre</button>
            <button @click="stop" class="btn --stop">Stop</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ----- Import -----
import { useSessionStore } from '../../stores/session';
import { useNuxtApp, useCookie } from '#app';
import { useUserStore } from '../../stores/user';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useGlobalEvents } from '../../composable/useGlobalEvent';
import { EGlobalEvent } from '../../assets/ts/enums/global/globalEvent.enum';
import useDateFormatter from '../../composable/useDate';

const userStore = useUserStore();
const sessionStore = useSessionStore();
const { $api } = useNuxtApp();
const token = useCookie('token');
const profile = ref();
const isLogged = ref<boolean>(false);

const startTime = ref(new Date()); // Exemple de startTime
const startTimeString = ref<string>('');

const elapsedTime = ref(0);
let interval = null;

const formattedElapsedTime = computed(() => {
  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

onMounted(() => {
  startTimeString.value = useDateFormatter().formatDate('2024-12-22T15:30:45', {
    customOptions: {
      weekday: 'long',
      year: 'numeric',
      Week: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Paris',
    },
  });

  interval = setInterval(() => {
    const now = new Date();
    elapsedTime.value = Math.floor((now - new Date(startTime.value)) / 1000);
  }, 1000);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});

// ----- Functions -----
async function start() {
  try {
    const response = await $api.post('/time-entries/start', {}, {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    console.log('response', response);

    // Supposons que la réponse contient { id: 'session-id' }
    const sessionIdFromApi = response.data.id;
    if (sessionIdFromApi) {
      sessionStore.sessionId = sessionIdFromApi;
      sessionStore.startSession();
      getProfile();
      startTime.value = response.data.startTime;
    } else {
      throw new Error('ID de session non reçu du serveur');
    }
  } catch (err) {
    console.error('Erreur lors du démarrage de la session', err);
  }
}

useGlobalEvents().subscribeTo<boolean | undefined>(EGlobalEvent.LOGGED, (isLoggedIn) => {
  if (typeof isLoggedIn !== 'boolean') return;
  isLogged.value = isLoggedIn;
});

onMounted(() => {
  getProfile();
});

async function getProfile() {
  profile.value = await userStore.fetchProfile($api);
}

async function pause() {
  try {
    console.log('profile', profile);

    await $api.patch(
      `/pauses/${profile.value.sessions[0].timeEntry.id}/start`,
      {},
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );
    sessionStore.pauseSession();
    getProfile();
  } catch (err) {
    console.error('Erreur lors de la mise en pause', err);
  }
}

async function resume() {
  try {
    await $api.patch(
      `/pauses/${profile.value.sessions[0].timeEntry.id}/resume`,
      {},
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );
    sessionStore.resumeSession();
    getProfile();
  } catch (err) {
    console.error('Erreur lors de la reprise de la session', err);
  }
}

async function stop() {
  try {
    await $api.patch(
      `/time-entries/${profile.value.sessions[0].timeEntry.id}/end`,
      {},
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );
    sessionStore.stopSession();
    getProfile();
  } catch (err) {
    console.error("Erreur lors de l'arrêt de la session", err);
  }
}

watch(isLogged, (newValue) => {
  if (newValue) {
    console.log('newValue', newValue);

    getProfile(); // Récupère le profil si l'utilisateur est connecté
  } else {
    profile.value = null; // Nettoie le profil si déconnecté
  }
});
</script>

<style lang="scss" scoped>
.time-session {
  &__card {
    margin: $spacing-large;
    background-color: $color-surface;
    border-radius: $border-radius;
    box-shadow: $box-shadow-light;
    padding: $spacing-large;
    margin-bottom: $spacing-medium;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &-header {
      margin-bottom: $spacing-medium;
      border-bottom: 1px solid $color-text-secondary;
      padding-bottom: $spacing-small;
    }

    &-title {
      font-size: $font-size-large;
      font-weight: bold;
      color: $color-primary-light;
    }

    &-body {
      p {
        margin: $spacing-small 0;
        font-size: $font-size-base;
        color: $color-text-primary;

        strong {
          color: $color-text-secondary;
        }
      }
    }

    &__actions {
      margin-top: $spacing-medium;
      display: flex;
      gap: $spacing-medium;

      .btn {
        flex: 1;
      }
    }
  }
}
</style>
