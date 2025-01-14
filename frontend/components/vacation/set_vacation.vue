<template>
  <div class="vacation">
    <div class="vacation__ultra-small">
      <button class="btn" @click="toggleVacationView = true">
        <i class="fa-solid fa-umbrella-beach"></i>
      </button>
    </div>

    <div class="vacation__small">
      <h2>Congés</h2>
      <form @submit.prevent="submitVacation" class="vacation__form">
        <div class="vacation__fields">
          <div class="vacation__field">
            <input id="startDate" v-model="vacation.startDate" type="date" class="pi-input" required />
          </div>
          <button type="submit" class="btn btn--primary">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </form>
    </div>

    <div class="vacation__large">
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
          <textarea
            id="reason"
            v-model="vacation.reason"
            rows="2"
            class="pi-input"
            placeholder="Optionnel"
          ></textarea>
        </div>

        <button type="submit" class="btn btn--primary">Ajouter</button>
      </form>
    </div>
  </div>

  <modal v-model="toggleVacationView" title="Vacances et jours fériés">
    <div class="vacation__modal">
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
          <textarea
            id="reason"
            v-model="vacation.reason"
            rows="2"
            class="pi-input"
            placeholder="Optionnel"
          ></textarea>
        </div>

        <button type="submit" class="btn btn--primary">Ajouter</button>
      </form>
    </div>
  </modal>
</template>

<script setup lang="ts">
// ---- Import ----- 
import { ref } from 'vue';
import { useNuxtApp, useCookie } from '#app'; 
import { useGlobalEvents } from '~/composable/useGlobalEvent';
import { EGlobalEvent } from '~/assets/ts/enums/global/globalEvent.enum';
// ------------------

// ---- Reactive ----
const vacation = ref({
  startDate: '',
  endDate: '',
  reason: '',
  status: 'pending',
});

const isHoliday = ref(false);
const toggleVacationView = ref(false);

const { $api } = useNuxtApp();
const token = useCookie('token');
// ------------------

// --- Async Func ---
const submitVacation = async () => {
  try {
    vacation.value.status = isHoliday.value ? 'public_holiday' : 'pending';

    const response = await $api.post('/vacations', vacation.value, {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    vacation.value = { startDate: '', endDate: '', reason: '', status: 'pending' };
    isHoliday.value = false;
    toggleVacationView.value = false;
    useGlobalEvents().emitEvent(EGlobalEvent.UPDATE_CALENDAR);
  } catch (error) {
    console.error('Erreur lors de l\'ajout des vacances :', error);
    alert('Une erreur est survenue. Veuillez réessayer.');
  }
};
// ------------------
</script>

<style lang="scss" scoped>
.vacation {
  color: $color-text-primary;
  width: 100%;
  height: inherit !important;
  box-sizing: border-box;
  position: relative;
  container-type: size;
  container-name: vacation;

  h2 {
    text-align: center;
    margin-bottom: $spacing-medium;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing-medium;
  }

  &__fields {
    display: flex;
    gap: $spacing-medium;
    align-items: flex-end;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $spacing-small;
    flex: 1;

    &.vacation__checkbox {
      justify-content: center;
      align-items: flex-start;
      margin-top: auto;
      flex: 0;
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

  // États par défaut
  &__ultra-small {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  &__small {
    display: none;
  }

  &__large {
    display: none;
  }

  // Règles de container
  @container vacation ((min-height: 70px) and (max-height: 245px)) and (min-width: 200px) {
    .vacation {
      padding: 0;
    }

    .vacation__ultra-small {
      display: none;
    }

    .vacation__small {
      display: block;
      padding: $spacing-medium;

      .vacation__fields {
        flex-direction: row;
        align-items: center;
      }

      .btn--primary {
        margin: 0;
        padding: $spacing-small;
      }
    }
  }

  @container vacation (min-height: 245px) and (min-width: 300px) {
    .vacation__large {
      display: block;
      padding: $spacing-large;
    }

    .vacation__small {
      display: none;
    }

    .vacation__ultra-small {
      display: none;
    }
  }
}

// Style pour la modale
.vacation__modal {
  padding: $spacing-large;

  h2 {
    margin-bottom: $spacing-large;
  }
}
</style>
