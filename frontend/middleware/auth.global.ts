import { defineNuxtRouteMiddleware, useCookie, navigateTo, useRoute } from '#app';
import { jwtDecode } from 'jwt-decode';

export default defineNuxtRouteMiddleware(() => {
  const token = useCookie('token');
  const route = useRoute();
  
  // Si nous sommes déjà sur la page d'accueil et que le token est null, ne rien faire
  // Cela évite la boucle infinie de redirection
  if (route.path === '/' && !token.value) {
    return;
  }

  if (token.value) {
    try {
      const decoded: any = jwtDecode(token.value);

      // Vérifier si le token est expiré
      const currentTime = Date.now() / 1000; // Temps actuel en secondes
      if (decoded.exp < currentTime) {
        console.warn('Token expiré, déconnexion forcée');
        token.value = null;
        
        // Ne rediriger que si nous ne sommes pas déjà sur la page d'accueil
        if (route.path !== '/') {
          return navigateTo('/');
        }
      }
    } catch (err) {
      console.error('Token invalide, suppression du token');
      token.value = null;
      
      // Ne rediriger que si nous ne sommes pas déjà sur la page d'accueil
      if (route.path !== '/') {
        return navigateTo('/');
      }
    }
  }
});
