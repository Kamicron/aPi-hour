import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons'; // Icônes gratuites Solid
// import { far } from '@fortawesome/pro-regular-svg-icons'; // Icônes Pro Regular
// import { fal } from '@fortawesome/pro-light-svg-icons'; // Icônes Pro Light
// import { fas as fasPro } from '@fortawesome/pro-solid-svg-icons'; // Icônes Pro Solid

// Ajoutez uniquement les icônes nécessaires pour réduire la taille du bundle

library.add(fas);

// Désactiver l'ajout automatique des styles (optionnel)
config.autoAddCss = false;

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon);
});
