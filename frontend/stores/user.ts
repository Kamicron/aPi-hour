import { defineStore } from 'pinia';
import { useCookie } from '#app';

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
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      profile.value = null;
    }
  }

  function logout() {
    token.value = null;
    profile.value = null;
  }

  return {
    token,
    profile,
    fetchProfile,
    logout,
  };
});
