import { defineStore } from 'pinia';
import { useCookie, useNuxtApp } from '#app';
import { useGlobalEvents } from '~/composables/useGlobalEvent';
import { EGlobalEvent } from '~/assets/ts/enums/global/globalEvent.enum';
import { EToast } from '~/assets/ts/enums/toast.enum';
import { useAxiosError } from '~/composables/useAxiosError';

export const useUserStore = defineStore('user', () => {
  const token = useCookie('token');
  const profile = ref<any>(null);
  const { $toast } = useNuxtApp();
  const { getErrorMessage } = useAxiosError();

  async function fetchProfile($api: any) {
    try {
      const response = await $api.get('/users/profile', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      profile.value = response.data;
      useGlobalEvents().emitEvent<boolean>(EGlobalEvent.LOGGED, true);
      $toast.show({
        message: `Bienvenue ${profile.value.username} !`,
        type: EToast.SUCCESS,
        duration: 3000
      });
      return response.data;

    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      profile.value = null;
      $toast.show({
        message: getErrorMessage(error),
        type: EToast.ERROR,
        duration: 5000
      });
    }
  }

  async function updateSettings($api: any, settings: { weeklyHoursGoal: number }) {
    try {
      const response = await $api.patch('/users/settings', settings, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      // Mise à jour locale
      if (profile.value) {
        profile.value = {
          ...profile.value,
          ...settings,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  }
  
  function logout() {
    token.value = null;
    profile.value = null;
    useGlobalEvents().emitEvent<boolean>(EGlobalEvent.LOGGED, false);
    $toast.show({
      message: 'Vous avez été déconnecté avec succès',
      type: EToast.INFO,
      duration: 3000
    });
  }

  return {
    token,
    profile,
    fetchProfile,
    updateSettings,
    logout,
  };
});
