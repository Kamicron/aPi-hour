<template>
  <div v-if="profile && isLogged" class="time-session">
    <h2>Sessions</h2>
    <div v-if="profile.sessions.length === 0" class="time-session__idle">
      <div class="time-session__card">
        <div class="status-bar status-bar--idle"></div>
        <button @click="start" class="btn">Démarrer</button>
      </div>
    </div>
    <div v-else>
      <div v-if="profile.sessions[0].status === 'started'" class="time-session__running">
        <div class="time-session__card">
          <div class="status-bar status-bar--running"></div>
          <p>Temps écoulé : <strong>{{ formattedElapsedTime }}</strong></p>
          <p>Heure de début : <strong>{{ startTimeString }}</strong></p>
          <div class="time-session__actions">
            <button @click="pause" class="btn btn--warning">Pause</button>
            <button @click="stop" class="btn btn--danger">Stop</button>
          </div>
        </div>
      </div>

      <div v-if="profile.sessions[0].status === 'paused'" class="time-session__paused">
        <div class="time-session__card">
          <div class="status-bar status-bar--paused"></div>
          <div class="time-session__actions">
            <button @click="resume" class="btn btn--success">Reprendre</button>
            <button @click="stop" class="btn btn--danger">Stop</button>
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
  getProfile();

  if (profile.value?.sessions[0]?.status === 'started') {
    startTime.value = new Date(profile.value.sessions[0].startTime);

    if (startTime.value) {
      const now = new Date();
      elapsedTime.value = Math.floor((now - new Date(startTime.value)) / 1000);

      // Démarrer le compteur
      interval = setInterval(() => {
        elapsedTime.value = Math.floor((new Date() - new Date(startTime.value)) / 1000);
      }, 1000);
    }
  }
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
      startTimeString.value = useDateFormatter().formatDate(startTime.value, { format: 'long', includeTime: true });
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

  if (profile.value?.sessions[0]?.status === 'started') {
    const sessionStartTime = new Date(profile.value.sessions[0].startTime);
    elapsedTime.value = Math.floor((new Date() - sessionStartTime) / 1000);
  }
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

    getProfile();
  } else {
    profile.value = null;
  }
});
</script>

<style lang="scss" scoped>
.time-session {
  margin: $spacing-large;
  background-color: $color-surface;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;
  padding: $spacing-large;
  margin-bottom: 0 0 $spacing-medium $spacing-medium;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &__card {
    position: relative;
    background-color: $color-background;
    border-radius: $border-radius;
    box-shadow: $box-shadow-light;
    padding: $spacing-large $spacing-large $spacing-large 24px;
    margin: $spacing-medium;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &-title {
      font-size: $font-size-large;
      font-weight: bold;
      color: $color-primary-light;
      margin-bottom: $spacing-medium;
    }

    p {
      margin: $spacing-small 0;
      font-size: $font-size-base;
      color: $color-text-primary;

      strong {
        color: $color-secondary;
      }
    }

  }

  &__actions {
    margin-top: $spacing-medium;
    display: flex;
    gap: $spacing-medium;


  }

  .status-bar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 8px;
    border-radius: $border-radius 0 0 $border-radius;

    &--idle {
      background-color: $color-danger;
    }

    &--running {
      background-color: $color-success;
    }

    &--paused {
      background-color: $color-warning;
    }
  }
}
</style>
