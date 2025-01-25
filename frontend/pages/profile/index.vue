<template>
  <div class="profile">
    <h2>Mon Profil</h2>
    <form class="profile__form" @submit.prevent="updateSettings">
      <div class="profile__form-group">
        <label for="weeklyHoursGoal" class="profile__label">Heures mensuelles prévues</label>
        <input type="number" id="weeklyHoursGoal" class="pi-input" v-model="settings.weeklyHoursGoal" required />
      </div>
      <button type="submit" class="profile__button">Mettre à jour</button>
    </form>
    <div class="working-days-form profile__form">
      <h2 class="working-days-form__title">Configurer vos jours ouvrés</h2>
      <form @submit.prevent="saveWorkingDays">

        <div class="working-days-form__checkboxes">
          <pi-checkbox v-for="day in sortedDays" :key="day.value" :id="`checkbox-${day.value}`" :value="day.value"
            v-model="selectedWorkingDays">
            {{ day.label }}
          </pi-checkbox>

        </div>
        <button type="submit" class="working-days-form__button">Enregistrer</button>
      </form>
    </div>
    <div v-if="message" class="profile__message">{{ message }}</div>


  </div>
</template>

<script setup lang='ts'>
// ----- Import -----
import { ref } from 'vue';
import { useUserStore } from '../../stores/user';
import { useNuxtApp } from '#app';
import { EToast } from '~/assets/ts/enums/toast.enum'
import { useAxiosError } from '~/composables/useAxiosError'

const { $toast } = useNuxtApp()
const { getErrorMessage } = useAxiosError()

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----

// ------------------

// ------ Const -----
const profileStore = useUserStore();
const { $api } = useNuxtApp();

const days = [
  { value: 0, label: "Dimanche" },
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
];

const sortedDays = days.slice(1).concat(days[0]);
// ------------------

// ---- Reactive ----
const settings = ref({
  weeklyHoursGoal: profileStore.profile?.weeklyHoursGoal || 35,
});

const message = ref('');

const selectedWorkingDays = ref<number[]>([1, 2, 3, 4, 5]);
// ------------------

// ---- Computed ----

// ------------------

// ------ Hooks -----

// ------------------

// --- Async Func ---
async function updateSettings() {
  try {
    await profileStore.updateSettings($api, settings.value);
    $toast.show({
      message: 'Profile mis à jour avec succès.',
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

async function saveWorkingDays() {
  try {
    await $api.patch("/users/me/working-days", {
      workingDays: selectedWorkingDays.value,
    }, {
      headers: {
        Authorization: `Bearer ${useCookie('token').value}`, // Vérifiez que le token est correct.
      },
    });

    $toast.show({
      message: 'Profile mis à jour avec succès.',
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
// ------------------

// ---- Function ----

// ------------------


// ------ Watch -----

// ------------------

</script>

<style lang='scss' scoped>
.profile {
  margin: $spacing-large;

  &__title {
    margin-bottom: $spacing-large;
  }

  &__form {
    background-color: $color-surface;
    padding: $spacing-large;
    border-radius: $border-radius;
    max-width: 600px;
    margin: 0 auto;
    box-shadow: $box-shadow-light;

    &-group {
      margin-bottom: $spacing-large;
    }

    &__label {
      display: block;
      margin-bottom: $spacing-small;
      font-weight: bold;
      color: $color-text-secondary;
      font-size: $font-size-small;
    }

    &__input {
      width: 100%;
      padding: $spacing-medium;
      border: 1px solid $color-primary-light;
      border-radius: $border-radius;
      background-color: $color-background;
      color: $color-text-primary;
      font-size: $font-size-base;

      &:focus {
        outline: none;
        border-color: $color-secondary;
        box-shadow: 0 0 5px $color-secondary;
      }
    }
  }

  &__button {
    @extend .btn;
    width: 100%;
    margin-top: $spacing-medium;
  }

  &__message {
    margin-top: $spacing-large;
    text-align: center;
    color: $color-success;
    font-size: $font-size-small;
  }
}

.working-days-form {
  margin-top: $spacing-large;

  &__title {
    color: $color-text-primary;
    text-align: center;
    font-size: $font-size-large;
    margin-bottom: $spacing-large;
  }

  &__checkboxes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-medium;
    margin-bottom: $spacing-large;
  }

  &__button {
    @extend .btn;
    width: 100%;
  }
}

.pi-input {
  padding: $spacing-medium;
  border: 1px solid $color-primary-light;
  border-radius: $border-radius;
  background-color: $color-background;
  color: $color-text-primary;
  font-size: $font-size-base;

  &:focus {
    outline: none;
    border-color: $color-secondary;
  }
}
</style>