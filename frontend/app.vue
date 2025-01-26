<template>
  <div>
    <pc-header />
    <div class="layout">
      <NuxtPage />
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../frontend/stores/auth';
import { onMounted } from 'vue';
import { Toast } from 'vue3-modern-toast'
import 'vue3-modern-toast/dist/style.css'
import { EToast } from '~/assets/ts/enums/toast.enum'
const { $toast } = useNuxtApp()

const authStore = useAuthStore();
onMounted(() => {
  authStore.fetchAuthStatus(); // Synchronise l'état d'authentification
});

$toast.configure({
  position: {
    top: 20,
    right: 20
  },
  styles: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    types: {
      [EToast.SUCCESS]: {
        backgroundColor: '#48BB78',
        color: '#ffffff',
        borderColor: '#2F855A'
      },
      [EToast.ERROR]: {
        backgroundColor: '#F56565',
        color: '#ffffff',
        borderColor: '#C53030'
      },
      [EToast.WARNING]: {
        backgroundColor: '#ED8936',
        color: '#ffffff',
        borderColor: '#C05621'
      },
      [EToast.INFO]: {
        backgroundColor: '#4299E1',
        color: '#ffffff',
        borderColor: '#2B6CB0'
      }
    }
  }
})
</script>

<style>
.layout {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>