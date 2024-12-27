<template>
  <div class="profile">
    <h1 class="profile__title">Mon Profil</h1>
    <form class="profile__form" @submit.prevent="updateSettings">
      <div class="profile__form-group">
        <label for="weeklyHoursGoal" class="profile__label">Heures mensuelles prévues</label>
        <input type="number" id="weeklyHoursGoal" class="pi-input" v-model="settings.weeklyHoursGoal" required />
      </div>
      <button type="submit" class="profile__button">Mettre à jour</button>
    </form>
    <div class="working-days-form">
      <h2 class="working-days-form__title">Configurer vos jours ouvrés</h2>
      <form @submit.prevent="saveWorkingDays">
        <div class="working-days-form__checkboxes">
          <label v-for="day in days" :key="day.value" class="working-days-form__checkbox">
            <input type="checkbox" :value="day.value" v-model="selectedWorkingDays" />
            {{ day.label }}
          </label>
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
    message.value = 'Paramètres mis à jour avec succès.';
  } catch (error) {
    console.error(error);
    message.value = 'Erreur lors de la mise à jour des paramètres.';
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

  } catch (error) {
    console.error(error);
    alert("Erreur lors de la mise à jour des jours ouvrés.");
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
  &__title {
    text-align: center;
    margin-bottom: 2rem;
    color: #fff;
  }

  &__form {
    background-color: $color-background;
    padding: 2rem;
    border-radius: 0.5rem;
    max-width: 600px;
    margin: 0 auto;

    &-group {
      margin-bottom: 1.5rem;
    }

    &__label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #fff;
    }

    &__input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid darken($color-background, 20%);
      border-radius: 0.25rem;
      background-color: lighten($color-background, 10%);
      color: #fff;

      &:focus {
        outline: none;
        border-color: lighten($color-background, 30%);
      }
    }
  }

  &__button {
    width: 100%;
    padding: 0.75rem;
    background-color: lighten($color-background, 20%);
    color: #fff;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;

    &:hover {
      background-color: lighten($color-background, 30%);
    }
  }

  &__message {
    margin-top: 1rem;
    text-align: center;
    color: lighten($color-background, 40%);
  }
}
</style>