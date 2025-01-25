<!-- toast-example.vue -->
<template>
  <div>
    <h2>Exemple d'utilisation du Toast</h2>
    <div class="buttons">
      <button @click="showSuccessToast">Succès</button>
      <button @click="showErrorToast">Erreur</button>
      <button @click="showWarningToast">Avertissement</button>
      <button @click="showInfoToast">Information</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $toast } = useNuxtApp()
import { EToast } from '~/assets/ts/enums/toast.enum'

const showSuccessToast = () => {
  $toast.show({
    message: 'Opération réussie !',
    type: EToast.SUCCESS,
    duration: 3000
  })
}

const showErrorToast = () => {
  $toast.show({
    message: 'Une erreur est survenue',
    type: EToast.ERROR,
    duration: 5000
  })
}

const showWarningToast = () => {
  $toast.show({
    message: 'Attention !',
    type: EToast.WARNING,
    icon: '⚠️'
  })
}

const showInfoToast = () => {
  $toast.show({
    message: 'Information importante',
    type: EToast.INFO,
    icon: 'ℹ️'
  })
}
</script>

<style scoped>
.buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
