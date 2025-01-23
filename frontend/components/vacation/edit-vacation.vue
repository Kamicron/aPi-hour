<template>
  <modal v-model="isModalOpen" title="Modifier les vacances">
    <form @submit.prevent="submitEdit" class="edit-vacation">
      <div class="edit-vacation__fields">
        <div class="edit-vacation__field">
          <label for="startDate" class="edit-vacation__label">Date de début</label>
          <input
            id="startDate"
            v-model="editedVacation.startDate"
            type="date"
            class="pi-input"
            required
          />
        </div>

        <div class="edit-vacation__field">
          <label for="endDate" class="edit-vacation__label">Date de fin</label>
          <input
            id="endDate"
            v-model="editedVacation.endDate"
            type="date"
            class="pi-input"
            required
          />
        </div>

        <div class="edit-vacation__field">
          <label for="status" class="edit-vacation__label">Statut</label>
          <select
            id="status"
            v-model="editedVacation.status"
            class="pi-input"
            required
          >
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Refusé</option>
            <option value="public_holiday">Jour férié</option>
          </select>
        </div>

        <div class="edit-vacation__field">
          <label for="reason" class="edit-vacation__label">Raison</label>
          <textarea
            id="reason"
            v-model="editedVacation.reason"
            rows="2"
            class="pi-input"
            placeholder="Optionnel"
          ></textarea>
        </div>
      </div>

      <div class="edit-vacation__actions">
        <button type="button" class="btn btn--danger" @click="closeModal">
          Annuler
        </button>
        <button type="submit" class="btn btn--success">
          Enregistrer
        </button>
      </div>
    </form>
  </modal>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';
import { useNuxtApp, useCookie } from '#app';
import { useGlobalEvents } from '~/composable/useGlobalEvent';
import { EGlobalEvent } from '~/assets/ts/enums/global/globalEvent.enum';
import Modal from '~/components/global/modal.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  vacation: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'update']);

const { $api } = useNuxtApp();
const token = useCookie('token');
const isModalOpen = ref(false);

const editedVacation = ref({
  startDate: '',
  endDate: '',
  reason: '',
  status: ''
});

// Mettre à jour les données du formulaire quand les props changent
watch(() => props.vacation, (newVacation) => {
  if (newVacation) {
    editedVacation.value = { ...newVacation };
  }
}, { immediate: true });

watch(() => props.isOpen, (newValue) => {
  isModalOpen.value = newValue;
}, { immediate: true });

watch(() => isModalOpen.value, (newValue) => {
  if (!newValue) {
    emit('close');
  }
});

const submitEdit = async () => {
  try {
    await $api.put(`/vacations/${props.vacation.id}`, editedVacation.value, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    
    useGlobalEvents().emitEvent(EGlobalEvent.UPDATE_CALENDAR);
    emit('update');
    closeModal();
  } catch (error) {
    console.error('Erreur lors de la modification des vacances:', error);
  }
};

const closeModal = () => {
  isModalOpen.value = false;
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.edit-vacation {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;

  &__fields {
    display: flex;
    flex-direction: column;
    gap: $spacing-medium;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $spacing-small;
  }

  &__label {
    font-size: $font-size-small;
    color: $color-text-secondary;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-medium;
  }
}

.btn {
  padding: $spacing-small $spacing-medium;
  border-radius: $border-radius;
  font-size: $font-size-small;
  cursor: pointer;
  transition: all 0.2s ease;

  &--primary {
    background-color: $color-primary;
    color: $color-text-primary;

    &:hover {
      background-color: darken($color-primary, 10%);
    }
  }

  &--secondary {
    background-color: transparent;
    color: $color-text-secondary;
    border: 1px solid $color-text-secondary;

    &:hover {
      background-color: rgba($color-text-secondary, 0.1);
    }
  }
}
</style>
