import { defineNuxtRouteMiddleware, useCookie, navigateTo } from '#app';
import { jwtDecode } from 'jwt-decode';

export default defineNuxtRouteMiddleware(() => {
  const token = useCookie('token');

  if (token.value) {
    try {
      const decoded: any = jwtDecode(token.value);

      // Vérifier si le token est expiré
      const currentTime = Date.now() / 1000; // Temps actuel en secondes
      if (decoded.exp < currentTime) {
        console.warn('Token expiré, déconnexion forcée');
        token.value = null;
        return navigateTo('/'); // Rediriger vers la page de connexion
      }
    } catch (err) {
      console.error('Token invalide, suppression du token');
      token.value = null;
      return navigateTo('/');
    }
  }
});
