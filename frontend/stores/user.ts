import { defineStore } from 'pinia';
import { useCookie } from '#app';
import { useGlobalEvents } from '~/composable/useGlobalEvent';
import { EGlobalEvent } from '~/assets/ts/enums/global/globalEvent.enum';

export const useUserStore = defineStore('user', () => {
  const token = useCookie('token');
  const profile = ref<any>(null);

  async function fetchProfile($api: any) {
    try {
      const response = await $api.get('/users/profile', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      profile.value = response.data;
      useGlobalEvents().emitEvent<boolean>(EGlobalEvent.LOGGED, true)
      return response.data;

    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      profile.value = null;
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
    console.log('logout user');
    console.log('profile.value', profile.value);
    
    
    useGlobalEvents().emitEvent<boolean>(EGlobalEvent.LOGGED, false)
  }

  return {
    token,
    profile,
    fetchProfile,
    updateSettings,
    logout,
  };
});
