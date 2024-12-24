<template>
  <div class="session-details">
    <h1 class="session-details__title">Détails de la session</h1>
    <p class="session-details__current-time">{{ currentTime }}</p>

    <div v-if="session" class="session-details__info">
      <p><strong>Début :</strong> {{ startSession }}</p>
      <p><strong>Fin :</strong> {{ endSession || "En cours" }}</p>
      <p><strong>Temps de travail :</strong> {{ formattedWorkTime }}</p>
      <p><strong>Temps de pause :</strong> {{ formattedPauseTime }}</p>
    </div>
    <hr class="divider" />

    <h2 class="session-details__subtitle">Pauses</h2>
    <ul class="session-details__pauses">
      <li v-for="pause in pauses" :key="pause.id" class="pause-item">
        <p>
          <strong>Début :</strong>
          {{ useDateFormatter().formatDate(pause.pauseStart, { customOptions: dateOptions }) }}
        </p>
        <p>
          <strong>Fin :</strong>
          {{ pause.pauseEnd
            ? useDateFormatter().formatDate(pause.pauseEnd, { customOptions: dateOptions })
            : "En cours" }}
        </p>
        <button class="btn btn--primary" @click="editPause(pause)">Modifier</button>
        <button class="btn btn--danger" @click="deletePause(pause.id)">
          <font-awesome-icon icon="trash" />
        </button>
      </li>
    </ul>

    <div class="form-container">
      <h3>Ajouter une pause</h3>
      <form @submit.prevent="addPause" class="form">
        <label for="newPauseStart" class="form__label">Début :</label>
        <input type="time" id="newPauseStart" v-model="newPauseStart" required class="form__input" />

        <label for="newPauseEnd" class="form__label">Fin :</label>
        <input type="time" id="newPauseEnd" v-model="newPauseEnd" class="form__input" />

        <button type="submit" class="btn btn--primary">Ajouter la pause</button>
      </form>
    </div>
    <hr class="divider" />

    <h2 class="session-details__subtitle">Modifier la session</h2>
    <form @submit.prevent="updateSession" class="form">
      <label for="start" class="form__label">Début :</label>
      <input type="time" v-model="editSession.startTime" id="start" class="form__input" />

      <label for="end" class="form__label">Fin :</label>
      <input type="time" v-model="editSession.endTime" id="end" class="form__input" />

      <button type="submit" class="btn btn--primary">Enregistrer les modifications</button>
    </form>
    <button class="btn btn--danger session-details__delete-session" @click="deleteSession">
      Supprimer la session
    </button>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp, useCookie } from "#app";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import useDateFormatter from "../../composable/useDate";

const { $api } = useNuxtApp();

const route = useRoute();
const sessionId = route.params.id as string;
const token = useCookie("token");

const session = ref<any>(null);
const pauses = ref<any[]>([]);
const editSession = ref({
  startTime: "",
  endTime: "",
});

const newDate = ref<Date>()

const startSession = ref<string>("");
const endSession = ref<string>("");

const newPauseStart = ref<Date>()
const newPauseEnd = ref<Date>()

const dateOptions = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const durationOptions = {
  customOptions: {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  },
};

// Calcul des durées
const totalPauseTime = computed(() => {
  return pauses.value.reduce((total, pause) => {
    if (pause.pauseStart && pause.pauseEnd) {
      const start = new Date(pause.pauseStart).getTime();
      const end = new Date(pause.pauseEnd).getTime();
      return total + (end - start);
    }
    return total;
  }, 0);
});

const totalWorkTime = computed(() => {
  if (session.value?.startTime && session.value?.endTime) {
    const start = new Date(session.value.startTime).getTime();
    const end = new Date(session.value.endTime).getTime();
    return end - start - totalPauseTime.value;
  }
  return 0;
});

const formattedPauseTime = computed(() =>
  useDateFormatter().calculateDuration(0, totalPauseTime.value, durationOptions)
);

const formattedWorkTime = computed(() =>
  useDateFormatter().calculateDuration(0, totalWorkTime.value, durationOptions)
);

function combineDateAndTime(date: string, time: string): string {
  const baseDate = new Date(date);
  const [hours, minutes] = time.split(':');
  baseDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return baseDate.toISOString();
}


async function fetchSessionDetails() {
  try {
    const response = await $api.get(`/time-entries/${sessionId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    session.value = response.data;
    pauses.value = response.data.pauses || [];
    editSession.value.startTime = response.data.startTime;
    editSession.value.endTime = response.data.endTime;
    startSession.value = useDateFormatter().formatDate(session.value.startTime, {
      customOptions: dateOptions,
    });
    endSession.value = useDateFormatter().formatDate(session.value.endTime, {
      customOptions: dateOptions,
    });
    newDate.value = session.value.startTime
    console.log('newDate.value', newDate.value);
    
  } catch (error) {
    console.error("Erreur lors du chargement des données :", error);
  }
}

async function addPause() {
  if (!newPauseStart.value) {
    alert("L'heure de début est requise pour ajouter une pause.");
    return;
  }

  try {
    const sessionDate = session.value.startTime; // Date de la session
    const payload = {
      pauseStart: combineDateAndTime(sessionDate, newPauseStart.value),
      pauseEnd: newPauseEnd.value ? combineDateAndTime(sessionDate, newPauseEnd.value) : null,
    };

    const response = await $api.patch(`/pauses/${sessionId}/add-with-dates`, payload, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    pauses.value.push(response.data);
    newPauseStart.value = "";
    newPauseEnd.value = "";
  } catch (error) {
    console.error("Erreur lors de l’ajout de la pause :", error);
  }
}

async function editPause(pause: any) {
  const newStart = prompt('Nouvelle heure de début (YYYY-MM-DD HH:mm:ss) :', pause.pauseStart);
  const newEnd = prompt('Nouvelle heure de fin (YYYY-MM-DD HH:mm:ss) :', pause.pauseEnd);

  if (!newStart || (pause.pauseEnd && !newEnd)) return;

  try {
    const payload = {
      pauseStart: new Date(newStart).toISOString(),
      pauseEnd: newEnd ? new Date(newEnd).toISOString() : null,
    };

    await $api.patch(`/pauses/${pause.id}/update`, payload, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    fetchSessionDetails(); // Recharger les données pour refléter les modifications
  } catch (error) {
    console.error('Erreur lors de la modification de la pause :', error);
  }
}

async function updateSession() {
  if (!editSession.value.startTime || !editSession.value.endTime) {
    alert("Les heures de début et de fin sont obligatoires.");
    return;
  }

  try {
    const sessionDate = session.value.startTime; // Utiliser la date de la session
    const startTime = combineDateAndTime(sessionDate, editSession.value.startTime);
    const endTime = combineDateAndTime(sessionDate, editSession.value.endTime);

    const response = await $api.patch(
      `/time-entries/${sessionId}`,
      { startTime, endTime },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );
    session.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la session :", error);
  }
}

async function deletePause(pauseId: string) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette pause ?")) return;

  try {
    await $api.delete(`/pauses/${pauseId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    pauses.value = pauses.value.filter((pause) => pause.id !== pauseId);
    alert("Pause supprimée avec succès.");
  } catch (error) {
    console.error("Erreur lors de la suppression de la pause :", error);
    alert("Une erreur est survenue lors de la suppression de la pause.");
  }
}

async function deleteSession() {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) return;

  try {
    await $api.delete(`/time-entries/${sessionId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    alert("Session supprimée avec succès.");

    const formattedDate = new Date(newDate.value).toISOString().split('T')[0];
    console.log('formattedDate', formattedDate);

    window.location.href = `/?date=${formattedDate}`;
    // window.location.href = "/sessions"; // Remplacez par votre route
  } catch (error) {
    console.error("Erreur lors de la suppression de la session :", error);
    alert("Une erreur est survenue lors de la suppression de la session.");
  }
}


onMounted(() => {
  fetchSessionDetails();
});
</script>

<style scoped lang="scss">
.session-details {
  color: $color-text-primary;
  background-color: $color-background;
  padding: $spacing-large;
  border-radius: $border-radius;

  &__title {
    font-size: $font-size-large;
    margin-bottom: $spacing-medium;
  }

  &__current-time {
    font-size: $font-size-small;
    color: $color-text-secondary;
    margin-bottom: $spacing-large;
  }

  &__info {
    background-color: $color-surface;
    padding: $spacing-medium;
    border-radius: $border-radius;
    box-shadow: $box-shadow-light;
    margin-bottom: $spacing-large;

    p {
      margin: $spacing-small 0;
    }
  }

  &__subtitle {
    font-size: $font-size-base;
    color: $color-primary;
    margin-bottom: $spacing-medium;
  }

  &__pauses {
    list-style: none;
    padding: 0;

    .pause-item {
      background-color: $color-surface;
      border-radius: $border-radius;
      padding: $spacing-medium;
      margin-bottom: $spacing-medium;
      box-shadow: $box-shadow-light;

      p {
        margin: $spacing-small 0;
      }
    }
  }
}

.form-container {
  background-color: $color-surface;
  padding: $spacing-large;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;
  margin-bottom: $spacing-large;

  h3 {
    font-size: $font-size-base;
    color: $color-primary;
    margin-bottom: $spacing-medium;
  }
}

.form {
  display: flex;
  flex-direction: column;

  &__label {
    margin-bottom: $spacing-small;
    font-size: $font-size-small;
    color: $color-text-secondary;
  }

  &__input {
    margin-bottom: $spacing-medium;
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
}

.pause-item__actions {
  display: flex;
  gap: $spacing-small;
}

.btn--danger {
  background-color: $color-danger;
  color: $color-text-secondary;
  border: none;
  padding: $spacing-small;
  border-radius: $border-radius;

  &:hover {
    background-color: darken($color-danger, 10%);
  }
}


.divider {
  border: none;
  height: 1px;
  background-color: $color-text-secondary;
  margin: $spacing-large 0;
}
</style>
