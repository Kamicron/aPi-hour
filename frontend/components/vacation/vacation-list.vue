<template>
  <div class="vacation-list">
    <div class="vacation-table">
      <div class="vacation-table__header">
        <div class="vacation-table__cell clickable" @click="toggleSort('startDate')">
          Date de début
          <span v-if="filters.sortBy === 'startDate'" class="sort-icon">
            <i v-if="filters.sortOrder === 'ASC'" class="fa-solid fa-sort-up"></i>
            <i v-else class="fa-solid fa-sort-down"></i>
          </span>
        </div>
        <div class="vacation-table__cell clickable" @click="toggleSort('endDate')">
          Date de fin
          <span v-if="filters.sortBy === 'endDate'" class="sort-icon">
            <i v-if="filters.sortOrder === 'ASC'" class="fa-solid fa-sort-up"></i>
            <i v-else class="fa-solid fa-sort-down"></i>
          </span>
        </div>
        <div class="vacation-table__cell">Raison</div>
        <div class="vacation-table__cell header-cell" ref="statusFilterRef">
          <div class="header-content" @click.stop="toggleStatusDropdown">
            <span>Statut</span>
            <span v-if="filters.status.length > 0" class="filter-badge">{{ filters.status.length }}</span>
            <span class="filter-icon"><i class="fa-solid fa-filter"></i></span>
          </div>
          <div v-show="showStatusDropdown" class="status-dropdown-wrapper">
            <div class="status-dropdown" @click.stop>
              <div class="checkbox-group">
                <label 
                  v-for="status in statusOptions" 
                  :key="status.value" 
                  class="checkbox-label"
                >
                  <input 
                    type="checkbox" 
                    :value="status.value"
                    v-model="tempFilters.status"
                  >
                  <span class="checkbox-text">{{ status.label }}</span>
                </label>
              </div>
              <div class="dropdown-actions">
                <button 
                  class="btn btn--outline btn--small" 
                  @click.stop="clearStatusFilter"
                >
                  Réinitialiser
                </button>
                <button 
                  class="btn btn--primary btn--small" 
                  @click.stop="applyStatusFilter"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="vacation-table__cell">Actions</div>
      </div>

      <div v-for="vacation in vacations.items" :key="vacation.id" class="vacation-table__row">
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

    <div v-if="vacations.total > 0" class="pagination">
      <button 
        v-if="vacations.hasPreviousPage"
        @click="changePage(vacations.page - 1)"
        class="btn btn--outline"
      >
        Précédent
      </button>
      <span class="pagination__info">
        Page {{ vacations.page }} sur {{ vacations.totalPages }}
        ({{ vacations.total }} résultat{{ vacations.total > 1 ? 's' : '' }})
      </span>
      <button 
        v-if="vacations.hasNextPage"
        @click="changePage(vacations.page + 1)"
        class="btn btn--outline"
      >
        Suivant
      </button>
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
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
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
const vacations = ref({
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false
});
const isEditModalOpen = ref(false);
const selectedVacation = ref(null);
const showDeleteModal = ref(false);
const vacationToDelete = ref(null);
const showStatusDropdown = ref(false);
const statusFilterRef = ref<HTMLElement | null>(null);
const tempFilters = ref({
  status: [] as string[]
});

const filters = ref({
  status: [] as string[],
  sortBy: 'startDate',
  sortOrder: 'DESC' as 'ASC' | 'DESC',
  page: 1,
  limit: 10
});

const statusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'rejected', label: 'Refusé' },
  { value: 'public_holiday', label: 'Jour férié' },
  { value: 'sick_leave', label: 'Congé maladie' }
];

const fetchVacations = async () => {
  try {
    const params: Record<string, string | string[]> = {
      page: filters.value.page.toString(),
      limit: filters.value.limit.toString(),
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder
    };

    if (filters.value.status.length > 0) {
      params.status = filters.value.status;
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.append(key, value);
      }
    });

    const response = await $api.get(`/vacations/my?${queryParams}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    vacations.value = response.data;

  } catch (error) {
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    });
  }
};

const toggleStatusDropdown = () => {
  showStatusDropdown.value = !showStatusDropdown.value;
  if (showStatusDropdown.value) {
    tempFilters.value.status = [...filters.value.status];
    nextTick(() => {
      positionDropdown();
    });
  }
};

const clearStatusFilter = () => {
  tempFilters.value.status = [];
};

const applyStatusFilter = () => {
  filters.value.status = [...tempFilters.value.status];
  filters.value.page = 1;
  fetchVacations();
  showStatusDropdown.value = false;
};

const toggleSort = (field: string) => {
  if (filters.value.sortBy === field) {
    filters.value.sortOrder = filters.value.sortOrder === 'ASC' ? 'DESC' : 'ASC';
  } else {
    filters.value.sortBy = field;
    filters.value.sortOrder = 'DESC';
  }
  filters.value.page = 1; // Réinitialiser la page lors du changement de tri
  fetchVacations();
};

const changePage = (newPage: number) => {
  filters.value.page = newPage;
  fetchVacations();
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
  document.addEventListener('click', handleClickOutside);
  tempFilters.value.status = [...filters.value.status];
  window.addEventListener('resize', positionDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', positionDropdown);
});

const positionDropdown = () => {
  if (!showStatusDropdown.value || !statusFilterRef.value) return;
  
  const dropdownEl = statusFilterRef.value.querySelector('.status-dropdown') as HTMLElement;
  const headerRect = statusFilterRef.value.getBoundingClientRect();
  
  if (!dropdownEl) return;
  
  // Position par défaut
  let top = headerRect.bottom;
  let left = headerRect.right - dropdownEl.offsetWidth;
  
  // Vérifier si le dropdown dépasse à droite
  if (left + dropdownEl.offsetWidth > window.innerWidth) {
    left = window.innerWidth - dropdownEl.offsetWidth - 16; // 16px de marge
  }
  
  // Vérifier si le dropdown dépasse en bas
  if (top + dropdownEl.offsetHeight > window.innerHeight) {
    top = headerRect.top - dropdownEl.offsetHeight;
  }
  
  // Appliquer les positions
  dropdownEl.style.top = `${top}px`;
  dropdownEl.style.left = `${left}px`;
};

const handleClickOutside = (event: MouseEvent) => {
  // Si on clique en dehors du dropdown et qu'il est ouvert
  if (
    showStatusDropdown.value && 
    statusFilterRef.value && 
    !statusFilterRef.value.contains(event.target as Node)
  ) {
    // Réinitialiser les filtres temporaires et fermer le dropdown
    tempFilters.value.status = [...filters.value.status];
    showStatusDropdown.value = false;
  }
};
</script>

<style lang="scss" scoped>
.vacation-table {
  
  position: relative;
  width: 100%;
  overflow: visible;
  background-color: $color-surface;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;

  &__header {
    min-width: 900px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    background-color: $color-background;
    padding: $spacing-medium;
    font-weight: bold;
    color: $color-text-secondary;
    border-top-left-radius: $border-radius;
    border-top-right-radius: $border-radius;
    position: relative;
    z-index: 2;
  }

  &__row {
    min-width: 900px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    padding: $spacing-medium;
    border-bottom: 1px solid $color-background;
    position: relative;
    z-index: 1;
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

.status-dropdown-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;
}

.status-dropdown {
  position: absolute;
  background: $color-surface;
  border: 1px solid $color-primary;
  border-radius: $border-radius;
  box-shadow: $box-shadow-dark;
  min-width: 250px;
  padding: $spacing-medium;
  pointer-events: auto;
  isolation: isolate;
}

.header-cell {
  position: relative;
  isolation: isolate;
  z-index: 3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  padding: $spacing-small;
  cursor: pointer;
  user-select: none;
  position: relative;
  z-index: 3;
  
  &:hover {
    color: $color-primary-light;
  }
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-small;
  margin-bottom: $spacing-medium;
  position: relative;
  z-index: 1001;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  padding: $spacing-small;
  color: $color-text-primary;
  cursor: pointer;
  user-select: none;
  position: relative;
  z-index: 1001;
  
  &:hover {
    background-color: rgba($color-primary, 0.1);
    border-radius: $border-radius;
  }

  input[type="checkbox"] {
    accent-color: $color-primary;
    cursor: pointer;
    position: relative;
    z-index: 1001;
  }
}

.filter-badge {
  background-color: $color-primary;
  color: $color-text-primary;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-small;
  padding: 0 4px;
}

.filter-icon {
  font-size: $font-size-small;
  color: $color-text-secondary;
  margin-left: $spacing-small;
}

.dropdown-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-small;
  padding-top: $spacing-medium;
  border-top: 1px solid rgba($color-text-secondary, 0.2);
  position: relative;
  z-index: 1001;
}

.btn--small {
  font-size: $font-size-small;
  padding: $spacing-small $spacing-medium;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-medium;
  gap: $spacing-medium;
}

.pagination__info {
  font-size: 14px;
  color: $color-text-secondary;
}

.sort-icon {
  font-size: 12px;
  margin-left: 4px;
}

.clickable {
  cursor: pointer;
}

.filters {
  margin-bottom: $spacing-medium;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  margin-bottom: $spacing-small;
}

.filter-group label {
  font-weight: bold;
  margin-right: $spacing-small;
}

.dropdown-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
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

@media (max-width: 768px) {
  .vacation-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
