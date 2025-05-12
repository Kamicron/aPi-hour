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
          <p>Temps écoulé : <strong>{{ formattedElapsedTime }}</strong></p>
          <p>Heure de début : <strong>{{ startTimeString }}</strong></p>

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
import { useGlobalEvents } from '../../composables/useGlobalEvent';
import { EGlobalEvent } from '../../assets/ts/enums/global/globalEvent.enum';
import useDateFormatter from '../../composables/useDate';
import { EToast } from '~/assets/ts/enums/toast.enum'
import { useAxiosError } from '~/composables/useAxiosError'

const { $toast } = useNuxtApp()
const { getErrorMessage } = useAxiosError()
const userStore = useUserStore();
const sessionStore = useSessionStore();
const { $api } = useNuxtApp();
const token = useCookie('token');
const profile = ref();
const isLogged = ref<boolean>(false);

const startTime = ref<Date | null>(null); // Date de début réelle de la session
const startTimeString = ref<string>(''); // Heure de début formatée
const elapsedTime = ref(0); // Temps écoulé en secondes
let interval: NodeJS.Timeout | null = null;

// const elapsedTime = ref(0);
// let interval = null;

const formattedElapsedTime = computed(() => {
  if (elapsedTime.value < 0 || isNaN(elapsedTime.value)) return '00:00:00';
  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});


onMounted(() => {
  getProfile();

  // Mise à jour régulière du temps écoulé
  interval = setInterval(() => {
    if (startTime.value instanceof Date && !isNaN(startTime.value.getTime())) {
      const now = new Date();
      elapsedTime.value = Math.floor((now.getTime() - startTime.value.getTime()) / 1000);
    }
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

    if (response.data.startTime) {
      startTime.value = new Date(response.data.startTime); // Mise à jour de la date de début
      startTimeString.value = useDateFormatter().formatDate(new Date(response.data.startTime), { format: 'long', includeTime: true });

      elapsedTime.value = 0; // Réinitialisation du temps écoulé
      getProfile();

      $toast.show({
        message: 'Session démarré avec succès.',
        type: EToast.SUCCESS,
        duration: 3000
      })
    } else {
      $toast.show({
        message: 'Date de début manquante dans la réponse du serveur',
        type: EToast.WARNING,
        duration: 3000
      })
    }
  } catch (error) {
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    })
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
  try {
    const fetchedProfile = await userStore.fetchProfile($api);
    profile.value = fetchedProfile;

    // Synchroniser la date de début si une session est active
    if (profile.value?.sessions?.length > 0 && profile.value.sessions[0].status === 'started') {
      const startTimeFromApi = profile.value.currentSession.createdAt;

      startTimeString.value = useDateFormatter().formatDate(startTimeFromApi, { format: 'long', includeTime: true });
      if (startTimeFromApi) {
        startTime.value = new Date(startTimeFromApi); // Conversion en Date valide
      } else {
        startTime.value = null; // Aucun startTime disponible
      }
    } else {
      startTime.value = null; // Pas de session active
    }

  } catch (error) {
    startTime.value = null; // Nettoyage en cas d'erreur
  }
}

async function pause() {
  try {
    await $api.patch(
      `/pauses/${profile.value.sessions[0].timeEntry.id}/start`,
      {},
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );
    sessionStore.pauseSession();
    getProfile();
    $toast.show({
      message: 'Mise en pause avec succès.',
      type: EToast.SUCCESS,
      duration: 3000
    })
  } catch (error) {
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    })
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
    $toast.show({
      message: 'Reprise de la session avec succès.',
      type: EToast.SUCCESS,
      duration: 3000
    })
  } catch (error) {
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    })
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
    $toast.show({
      message: 'Arrêt de la session avec succès.',
      type: EToast.SUCCESS,
      duration: 3000
    })
  } catch (error) {
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    })
  }
}

watch(isLogged, (newValue) => {
  if (newValue) {
    getProfile(); // Récupère le profil si l'utilisateur est connecté
  } else {
    profile.value = null; // Nettoie le profil si déconnecté
  }
});
</script>

<style lang="scss" scoped>
.time-session {
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



@media (max-width: 768px) {
  .time-session {
    margin: $spacing-medium;
    margin-top: 50px;

    &__actions {
      flex-direction: column;
    }
  }

  .btn {
    width: 100%;
  }
}
</style>
