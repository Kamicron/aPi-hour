<template>
  <div class="vacation-list">
    <div class="vacation-table">
      <div class="vacation-table__header">
        <div class="vacation-table__cell">Date de début</div>
        <div class="vacation-table__cell">Date de fin</div>
        <div class="vacation-table__cell">Raison</div>
        <div class="vacation-table__cell">Statut</div>
        <div class="vacation-table__cell">Actions</div>
      </div>

      <div v-for="vacation in sortedVacations" :key="vacation.id" class="vacation-table__row">
        <div class="vacation-table__cell">{{ formatDate(vacation.startDate) }}</div>
        <div class="vacation-table__cell">{{ formatDate(vacation.endDate) }}</div>
        <div class="vacation-table__cell">{{ vacation.reason || '-' }}</div>
        <div class="vacation-table__cell">
          <span :class="getStatusClass(vacation.status)">
            {{ getStatusText(vacation.status) }}
          </span>
        </div>
        <div class="vacation-table__cell vacation-table__actions">
          <button class="btn btn--outline" @click="openEditModal(vacation)">
            Modifier
          </button>
          <button class="btn btn--danger" @click="deleteVacation(vacation)">
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal d'édition -->
    <edit-vacation :is-open="isEditModalOpen" :vacation="selectedVacation" @close="closeEditModal"
      @update="fetchVacations" />
    <Modal v-model="showDeleteModal" title="Confirmation">
      <p>Êtes-vous sûr de vouloir supprimer ces vacances ?</p>
      <div class="modal-actions">
        <button class="btn btn--danger" @click="confirmDelete">Supprimer</button>
        <button class="btn btn--outline" @click="showDeleteModal = false">Annuler</button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNuxtApp, useCookie } from '#app';
import { useGlobalEvents } from '~/composables/useGlobalEvent';
import { EGlobalEvent } from '~/assets/ts/enums/global/globalEvent.enum';
import EditVacation from '~/components/vacation/edit-vacation.vue';
import Modal from '~/components/global/modal.vue';
import { EToast } from '~/assets/ts/enums/toast.enum'
import { useAxiosError } from '~/composables/useAxiosError'

const { $toast } = useNuxtApp()
const { getErrorMessage } = useAxiosError()
const { $api } = useNuxtApp();
const token = useCookie('token');
const vacations = ref([]);
const isEditModalOpen = ref(false);
const selectedVacation = ref(null);
const showDeleteModal = ref(false);
const vacationToDelete = ref(null);

const sortedVacations = computed(() => {
  return [...vacations.value].sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
});

const fetchVacations = async () => {
  try {
    const response = await $api.get('/vacations/my', {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    vacations.value = response.data;

  } catch (error) {
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    })
  }
};

async function deleteVacation(vacation: any) {
  vacationToDelete.value = vacation;
  showDeleteModal.value = true;
}

async function confirmDelete() {
  if (!vacationToDelete.value) return;
  
  try {
    await $api.delete(`/vacations/${vacationToDelete.value.id}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    showDeleteModal.value = false;
    await fetchVacations();
    useGlobalEvents().emitEvent(EGlobalEvent.UPDATE_CALENDAR);

    $toast.show({
      message: 'Vacances supprimées avec succès.',
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

const openEditModal = (vacation) => {
  selectedVacation.value = vacation;
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  selectedVacation.value = null;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusClass = (status: string) => {
  return {
    'status-pending': status === 'pending',
    'status-approved': status === 'approved',
    'status-rejected': status === 'rejected',
    'status-holiday': status === 'public_holiday'
  };
};

const getStatusText = (status: string) => {
  const statusMap = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Refusé',
    public_holiday: 'Jour férié',
    sick_leave: 'Congé maladie'
  };
  return statusMap[status] || status;
};

// Écouter les événements de mise à jour
useGlobalEvents().subscribeTo(EGlobalEvent.UPDATE_CALENDAR, () => {
  fetchVacations();
});

onMounted(() => {
  fetchVacations();
});
</script>

<style lang="scss" scoped>
.vacation-table {
  background-color: $color-surface;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;
  overflow: hidden;

  &__header {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    background-color: $color-background;
    padding: $spacing-medium;
    font-weight: bold;
    color: $color-text-secondary;
  }

  &__row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    padding: $spacing-medium;
    border-bottom: 1px solid $color-background;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:last-child {
      border-bottom: none;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background-color: $color-primary-light;
      opacity: 0.15;
      transition: transform 0.3s ease;
      z-index: 0;
    }

    &:hover {
      transform: translateX(4px);

      &::before {
        transform: translateX(100%);
      }
    }
  }

  &__cell {
    display: flex;
    align-items: center;
    padding: 0 $spacing-small;
    position: relative;
    z-index: 1;
  }

  &__actions {
    display: flex;
    gap: $spacing-small;

    .btn {
      min-width: 120px;  // Définir une largeur minimale fixe pour tous les boutons
      justify-content: center;  // Centrer le texte dans les boutons
    }
  }
}

.status-pending {
  color: $color-warning;
}

.status-approved {
  color: $color-success;
}

.status-rejected {
  color: $color-danger;
}

.status-holiday {
  color: $color-primary-light;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-medium;
  margin-top: $spacing-large;
}

.btn {
  height: 41px 
}
</style>
