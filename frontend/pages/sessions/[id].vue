<template>
  <div class="session-details">
    <div class="session-details__header">
      <button class="btn btn--secondary" @click="redirectToDate">
        <i class="fa-solid fa-arrow-left"></i> Retour
      </button>
      <div class="session-details__actions">
        <button class="btn btn--ghost" @click="copySessionId" title="Copier l'ID">
          <i class="fa-regular fa-copy"></i>
        </button>
        <button class="btn btn--primary" @click="isUpdateSessionModal = true">
          <i class="fa-solid fa-pen-to-square"></i> Modifier la session
        </button>
        <button class="btn btn--danger" @click="showDeleteSessionModal = true">
          <i class="fa-solid fa-trash"></i> Supprimer la session
        </button>
      </div>
    </div>

    <div class="session-details__content">
      <div class="session-details__info">
        <h2 class="session-details__title">Détails de la session</h2>
        <div class="session-details__time">
          <p>
            <strong>Début :</strong>
            {{ session?.startTime ? formatDate(session.startTime) : '' }}
          </p>
          <p>
            <strong>Fin :</strong>
            {{ session?.endTime ? formatDate(session.endTime) : "En cours" }}
          </p>
        </div>
      </div>

      <div class="session-details__pauses-section">
        <div class="session-details__pauses-header">
          <h2 class="session-details__title">Pauses</h2>
          <button class="btn btn--primary" @click="isUpdatePauseModal = true">
            <i class="fa-solid fa-plus"></i> Ajouter une pause
          </button>
        </div>

        <ul class="session-details__pauses-list">
          <li v-for="pause in pauses" :key="pause.id" class="pause-item">
            <div class="pause-item__content">
              <p>
                <strong>Début :</strong>
                {{ pause.pauseStart ? formatTimeOnly(pause.pauseStart) : '' }}
              </p>
              <p>
                <strong>Fin :</strong>
                {{ pause.pauseEnd ? formatTimeOnly(pause.pauseEnd) : "En cours" }}
              </p>
            </div>
            <div class="pause-item__actions">
              <button class="btn btn--secondary btn--small" @click="editPause(pause)">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn--danger btn--small" @click="deletePause(pause)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <time-form-modal
      v-model="isUpdatePauseModal"
      mode="add-pause"
      @submit="handleAddPause"
    />

    <time-form-modal
      v-model="showEditPauseModal"
      mode="edit-pause"
      :initial-data="selectedPause"
      @submit="handleEditPause"
    />

    <time-form-modal
      v-model="isUpdateSessionModal"
      mode="edit-session"
      :initial-data="editSession"
      :is-end-required="true"
      @submit="handleEditSession"
    />

    <Modal v-model="showDeletePauseModal" title="Confirmation">
      <p>Êtes-vous sûr de vouloir supprimer cette pause ?</p>
      <div class="modal-actions">
        <button class="btn btn--danger" @click="confirmDeletePause">Supprimer</button>
        <button class="btn btn--outline" @click="showDeletePauseModal = false">Annuler</button>
      </div>
    </Modal>

    <Modal v-model="showDeleteSessionModal" title="Confirmation">
      <p>Êtes-vous sûr de vouloir supprimer cette session ?</p>
      <div class="modal-actions">
        <button class="btn btn--danger" @click="confirmDeleteSession">Supprimer</button>
        <button class="btn btn--outline" @click="showDeleteSessionModal = false">Annuler</button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNuxtApp, useCookie } from '#app'
import { EToast } from '~/assets/ts/enums/toast.enum'
import { useAxiosError } from '~/composables/useAxiosError'
import Modal from '~/components/global/modal.vue'
import TimeFormModal from '~/components/global/time-form-modal.vue'

const { $api, $toast } = useNuxtApp()
const { getErrorMessage } = useAxiosError()
const route = useRoute()
const router = useRouter()
const token = useCookie('token')

const sessionId = route.params.id as string
const session = ref<any>(null)
const pauses = ref<any[]>([])
const editSession = ref({
  startTime: "",
  endTime: "",
})

const isUpdatePauseModal = ref(false)
const isUpdateSessionModal = ref(false)
const showDeletePauseModal = ref(false)
const showDeleteSessionModal = ref(false)
const showEditPauseModal = ref(false)
const selectedPauseId = ref('')
const selectedPause = ref(null)
const pauseToDelete = ref(null)
const formattedDate = ref('')

function formatDate(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleString();
}

function formatTimeOnly(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

async function fetchSessionDetails() {
  try {
    const response = await $api.get(`/time-entries/${sessionId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    session.value = response.data;
    pauses.value = response.data.pauses || [];
    editSession.value.startTime = formatTimeOnly(response.data.startTime);
    editSession.value.endTime = formatTimeOnly(response.data.endTime);
    formattedDate.value = new Date(session.value.startTime).toISOString().split('T')[0];
  } catch (error) {
    console.error("Erreur lors du chargement des données :", error);
  }
}

function combineDateAndTime(date: string, time: string): string {
  const baseDate = new Date(date);
  const [hours, minutes] = time.split(':');
  baseDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return baseDate.toISOString();
}

async function editPause(pause: any) {
  selectedPauseId.value = pause.id;
  selectedPause.value = pause;
  showEditPauseModal.value = true;
}

function redirectToDate() {
  if (typeof window !== "undefined") {
    const date = formattedDate.value; // Accès à la valeur réactive
    if (date) {
      window.location.href = `/?date=${date}`;
    } else {
      console.error("La date formatée est invalide.");
    }
  } else {
    console.error("L'environnement ne permet pas d'accéder à `window`.");
  }
}

async function handleAddPause({ startTime, endTime }) {
  try {
    const sessionDate = session.value.startTime;
    const payload = {
      pauseStart: combineDateAndTime(sessionDate, startTime),
      pauseEnd: endTime ? combineDateAndTime(sessionDate, endTime) : null,
    };

    await $api.patch(`/pauses/${sessionId}/add-with-dates`, payload, {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    await fetchSessionDetails();
    isUpdatePauseModal.value = false;
    $toast.show({
      message: 'Pause ajoutée avec succès.',
      type: EToast.SUCCESS,
      duration: 3000
    });
  } catch (error) {
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    });
  }
}

async function handleEditPause({ startTime, endTime }) {
  try {
    if (!startTime) {
      $toast.show({
        message: "L'heure de début est requise.",
        type: EToast.WARNING,
        duration: 3000
      });
      return;
    }

    const sessionDate = selectedPause.value.pauseStart;
    const payload = {
      pauseStart: combineDateAndTime(sessionDate, startTime),
      pauseEnd: endTime ? combineDateAndTime(sessionDate, endTime) : null
    };

    await $api.patch(
      `/pauses/${selectedPauseId.value}/update`,
      payload,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );

    showEditPauseModal.value = false;
    fetchSessionDetails();
    $toast.show({
      message: 'Pause modifiée avec succès.',
      type: EToast.SUCCESS,
      duration: 3000
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la pause:', error);
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    });
  }
}

async function handleEditSession({ startTime, endTime }) {
  try {
    const sessionDate = session.value.startTime;
    const startTimeISO = combineDateAndTime(sessionDate, startTime);
    const endTimeISO = combineDateAndTime(sessionDate, endTime);

    const response = await $api.patch(
      `/time-entries/${sessionId}`,
      { startTime: startTimeISO, endTime: endTimeISO },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );
    session.value = response.data;
    isUpdateSessionModal.value = false;
    fetchSessionDetails();

    $toast.show({
      message: 'Session modifiée avec succès.',
      type: EToast.SUCCESS,
      duration: 3000
    });
  } catch (error) {
   
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    });
  }
}

async function deletePause(pause: any) {
  pauseToDelete.value = pause;
  showDeletePauseModal.value = true;
}

async function confirmDeletePause() {
  if (!pauseToDelete.value) return;

  try {
    await $api.delete(`/pauses/${pauseToDelete.value.id}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    pauses.value = pauses.value.filter((pause) => pause.id !== pauseToDelete.value.id);
    showDeletePauseModal.value = false;
    $toast.show({
      message: 'Pause supprimée avec succès.',
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

async function confirmDeleteSession() {
  try {
    await $api.delete(`/time-entries/${sessionId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    showDeleteSessionModal.value = false;
    window.location.href = `/?date=${formattedDate.value}`;
    $toast.show({
      message: 'Session supprimée avec succès.',
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

async function copySessionId() {
  try {
    await navigator.clipboard.writeText(sessionId);
    $toast.show({
      message: 'ID de la session copié !',
      type: EToast.INFO,
      duration: 2000
    });
  } catch (error) {
    $toast.show({
      message: 'Erreur lors de la copie de l\'ID',
      type: EToast.ERROR,
      duration: 3000
    });
  }
}

onMounted(() => {
  fetchSessionDetails();
});
</script>

<style lang="scss" scoped>
.session-details {
  padding: $spacing-large;
  max-width: 1200px;
  margin: 0 auto;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-large;
  }

  &__actions {
    display: flex;
    gap: $spacing-medium;
  }

  &__content {
    background-color: $color-surface;
    border-radius: $border-radius;
    box-shadow: $box-shadow-light;
    padding: $spacing-large;
  }

  &__info {
    margin-bottom: $spacing-large;
    padding-bottom: $spacing-large;
    border-bottom: 1px solid rgba($color-text-secondary, 0.2);
  }

  &__title {
    font-size: $font-size-large;
    color: $color-primary-light;
    margin-bottom: $spacing-medium;
  }

  &__time {
    display: flex;
    gap: $spacing-large;
    color: $color-text-primary;

    p {
      strong {
        color: $color-text-secondary;
        margin-right: $spacing-small;
      }
    }
  }

  &__pauses-section {
    margin-top: $spacing-large;
  }

  &__pauses-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-large;
  }

  &__pauses-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-medium;
    list-style: none;
    padding: 0;
  }
}

.pause-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba($color-background, 0.5);
  border-radius: $border-radius;
  padding: $spacing-medium;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba($color-background, 0.8);
  }

  &__content {
    p {
      margin: $spacing-small 0;
      color: $color-text-primary;

      strong {
        color: $color-text-secondary;
        margin-right: $spacing-small;
      }
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-small;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;

  &__label {
    margin-bottom: $spacing-small;
    font-size: $font-size-small;
    color: $color-text-secondary;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-medium;
  margin-top: $spacing-large;
}

.divider {
  border: none;
  height: 1px;
  background-color: $color-text-secondary;
  margin: $spacing-large 0;
}
</style>
