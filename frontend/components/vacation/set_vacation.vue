<template>
  <div class="vacation">
    <form @submit.prevent="submitVacation" class="vacation__form">
      <h2 class="vacation__title">Vacances et jours fériés</h2>

      <div class="vacation__fields">
        <div class="vacation__field">
          <label for="startDate" class="vacation__label">Date de début</label>
          <input id="startDate" v-model="vacation.startDate" type="date" class="pi-input" required />
        </div>

        <div class="vacation__field">
          <label for="endDate" class="vacation__label">Date de fin</label>
          <input id="endDate" v-model="vacation.endDate" type="date" class="pi-input" required />
        </div>

        <div class="vacation__field vacation__checkbox">
          <pi-checkbox id="isHoliday" v-model="isHoliday">Jour férié</pi-checkbox>
        </div>
      </div>

      <div v-if="!isHoliday" class="vacation__field">
        <label for="reason" class="vacation__label">Raison</label>
        <textarea id="reason" v-model="vacation.reason" rows="2" class="pi-input" placeholder="Optionnel"></textarea>
      </div>

      <button type="submit" class="btn btn--primary">Ajouter</button>
    </form>
  </div>
</template>

<script setup lang="ts">
// ---- Import ----- 
import { ref } from 'vue';
import { useNuxtApp, useCookie } from '#app';
import { useGlobalEvents } from '~/composables/useGlobalEvent';
import { EGlobalEvent } from '~/assets/ts/enums/global/globalEvent.enum';
import { EToast } from '~/assets/ts/enums/toast.enum'
import { useAxiosError } from '~/composables/useAxiosError'

const { $toast } = useNuxtApp()
const { getErrorMessage } = useAxiosError()

// ---- Reactive ----
const vacation = ref({
  startDate: '',
  endDate: '',
  reason: '',
  status: 'pending',
});

const isHoliday = ref(false);

const { $api } = useNuxtApp();
const token = useCookie('token');

// --- Async Func ---
const submitVacation = async () => {
  try {
    vacation.value.status = isHoliday.value ? 'public_holiday' : 'pending';

    const response = await $api.post('/vacations', vacation.value, {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    vacation.value = { startDate: '', endDate: '', reason: '', status: 'pending' };
    isHoliday.value = false;
    useGlobalEvents().emitEvent(EGlobalEvent.UPDATE_CALENDAR);
    $toast.show({
      message: 'Vacances ajoutées avec succès.',
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
};
</script>

<style lang="scss" scoped>
.vacation {
  background-color: $color-surface;
  padding: $spacing-large;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;
  color: $color-text-primary;

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing-medium;
  }

  &__fields {
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $spacing-small;

    &.vacation__checkbox {
      justify-content: center;
      align-items: flex-start;
      margin-top: auto;
    }
  }

  &__label {
    font-size: $font-size-small;
    color: $color-text-secondary;
  }

  .btn--primary {
    margin-top: $spacing-small;
    align-self: center;
    padding: $spacing-small $spacing-large;
    background-color: $color-primary;
    color: $color-text-primary;
    border-radius: $border-radius;
    box-shadow: $box-shadow-light;

    &:hover {
      background-color: darken($color-primary, 10%);
    }
  }
}
</style>
