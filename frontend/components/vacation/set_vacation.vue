<template>
  <div class="vacation">
    <form @submit.prevent="submitVacation" class="vacation__form">
      <h2 class="vacation__title">Ajouter des vacances</h2>

      <div class="vacation__field">
        <label for="startDate" class="vacation__label">Date de début</label>
        <input id="startDate" v-model="vacation.startDate" type="date" class="pi-input" required />
      </div>

      <div class="vacation__field">
        <label for="endDate" class="vacation__label">Date de fin</label>
        <input id="endDate" v-model="vacation.endDate" type="date" class="pi-input" required />
      </div>

      <div class="vacation__field">
        <label for="reason" class="vacation__label">Raison</label>
        <textarea id="reason" v-model="vacation.reason" rows="3" class="pi-input" placeholder="Optionnel"></textarea>
      </div>

      <button type="submit" class="btn btn">Ajouter</button>
    </form>
  </div>
</template>

<script setup lang="ts">
// ---- Import -----
import { ref } from 'vue';
import { useNuxtApp, useCookie   } from '#app'; // Ajout de useRoute

// ---- Reactive ----
const vacation = ref({
  startDate: '',
  endDate: '',
  reason: '',
});

const { $api } = useNuxtApp();
const token = useCookie('token');

// --- Async Func ---
const submitVacation = async () => {
  try {
    const response = await $api.post('/vacations', vacation.value, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    console.log('Vacances ajoutées avec succès :', response.data);
    alert('Vacances ajoutées avec succès !');
    vacation.value = { startDate: '', endDate: '', reason: '' }; // Réinitialisation du formulaire
  } catch (error) {
    console.error('Erreur lors de l\'ajout des vacances :', error);
    alert('Une erreur est survenue. Veuillez réessayer.');
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
    gap: $spacing-large;
  }

  &__title {
    font-size: $font-size-large-xl;
    color: $color-primary;
    margin-bottom: $spacing-large;
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
}
</style>
