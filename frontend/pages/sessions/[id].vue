<template>
  <div class="session-details">
    <h1>Détails de la session</h1>
    <p>{{ currentTime }}</p>
    <div v-if="session">
      <p><strong>Début :</strong> {{ startSession }}</p>
      <p><strong>Fin :</strong> {{ endSession || "En cours" }}</p>
      <p><strong>Temps de travail :</strong> {{ formattedWorkTime }}</p>
      <p><strong>Temps de pause :</strong> {{ formattedPauseTime }}</p>
    </div>
    <hr />

    <h2>Pauses</h2>
    <ul>
      <li v-for="pause in pauses" :key="pause.id">
        Début : {{ useDateFormatter().formatDate(pause.pauseStart, {
      customOptions: dateOptions,
    }) }} - Fin : {{ useDateFormatter().formatDate(pause.pauseEnd, {
      customOptions: dateOptions,
    }) || "En cours" }}
        <button @click="editPause(pause)">Modifier</button>
      </li>
    </ul>
    <button @click="addPause">Ajouter une pause</button>
    <hr />

    <h2>Modifier la session</h2>
    <form @submit.prevent="updateSession">
      <label for="start">Début :</label>
      <input type="datetime-local" v-model="editSession.startTime" id="start" />

      <label for="end">Fin :</label>
      <input type="datetime-local" v-model="editSession.endTime" id="end" />

      <button type="submit">Enregistrer les modifications</button>
    </form>
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

const startSession = ref<string>("");
const endSession = ref<string>("");

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
  } catch (error) {
    console.error("Erreur lors du chargement des données :", error);
  }
}

async function addPause() {
  try {
    const response = await $api.patch(`/pauses/${sessionId}/start`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    pauses.value.push(response.data);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la pause :", error);
  }
}

async function editPause(pause: any) {
  const newEndTime = prompt(
    "Nouvelle heure de fin (YYYY-MM-DD HH:mm:ss) :",
    pause.pauseEnd
  );
  if (!newEndTime) return;

  try {
    await $api.patch(
      `/pauses/${pause.id}/resume`,
      {
        pauseEnd: newEndTime,
      },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );
    fetchSessionDetails();
  } catch (error) {
    console.error("Erreur lors de la modification de la pause :", error);
  }
}

async function updateSession() {
  try {
    const response = await $api.patch(
      `/time-entries/${sessionId}`,
      {
        startTime: editSession.value.startTime,
        endTime: editSession.value.endTime,
      },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );
    session.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la session :", error);
  }
}

onMounted(() => {
  fetchSessionDetails();
});
</script>

<style scoped lang="scss">
.session-details {
  color: #ffffff;
  background-color: #20242b;
  padding: 20px;
  border-radius: 8px;

  h1,
  h2 {
    margin-bottom: 10px;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 8px;
    }
  }

  form {
    display: flex;
    flex-direction: column;

    label {
      margin-top: 10px;
    }

    button {
      margin-top: 20px;
      padding: 10px;
      border: none;
      background-color: #00aaff;
      color: white;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background-color: #0088cc;
      }
    }
  }
}
</style>
