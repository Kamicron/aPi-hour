import { defineNuxtPlugin } from '#app';
import { GridLayout, GridItem } from 'vue-grid-layout-v3';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('grid-layout', GridLayout);
  nuxtApp.vueApp.component('grid-item', GridItem);
});
