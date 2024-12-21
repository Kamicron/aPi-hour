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

  function logout() {
    token.value = null;
    profile.value = null;
    console.log('logout');
    
    useGlobalEvents().emitEvent<boolean>(EGlobalEvent.LOGGED, false)
  }

  return {
    token,
    profile,
    fetchProfile,
    logout,
  };
});
