<template>
  <div class="work-sessions">
    <div v-if="profileStore.profile" class="work-sessions__layout">
      <div
        v-for="(component, index) in components"
        :key="component.id"
        class="work-sessions__layout--item"
        :style="{ gridArea: component.gridArea }"
        draggable="true"
        @dragstart="onDragStart(index)"
        @dragover.prevent
        @drop="onDrop(index)"
      >
        <component class="work-sessions__layout--component" :is="componentsMap[component.name]" v-bind="component.props" />
      </div>
    </div>
    <div v-else>
      Veuillez vous connecter
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useNuxtApp, useCookie } from '#app';
import { useUserStore } from '../../stores/user';

// Import des composants
import Calendar from './calendar.vue';
import ResumeSession from './resume-session.vue';
import ExtraHoursDisplay from './extra-hours-display.vue';
import SetVacation from '../vacation/set_vacation.vue';
import ExtraHoursRate from './extra-hours-rate.vue';
import ExtraHoursPdf from './extra-hours-pdf.vue';

// Mapping des composants
const componentsMap = {
  calendar: Calendar,
  "resume-session": ResumeSession,
  "extra-hours-display": ExtraHoursDisplay,
  "set_vacation": SetVacation,
  "extra-hours-rate": ExtraHoursRate,
  "extra-hours-pdf": ExtraHoursPdf,
};

// Variables globales
const { $api } = useNuxtApp();
const token = useCookie('token');
const profileStore = useUserStore();

const currentMonth = ref('2025-01'); // Mois actuel
const selectedDate = ref(new Date().toISOString().slice(0, 10)); // Date sélectionnée
const summary = ref<any | null>(null);

// Composants dynamiques avec positions
const components = ref([
  { id: "calendar", name: "calendar", gridArea: "1 / 1 / 3 / 3", props: {} },
  { id: "resume", name: "resume-session", gridArea: "1 / 3 / 3 / 5", props: { selectedDate } },
  { id: "display", name: "extra-hours-display", gridArea: "1 / 5 / 2 / 7", props: {} },
  { id: "vacation", name: "set_vacation", gridArea: "3 / 4 / 4 / 7", props: {} },
  { id: "rate", name: "extra-hours-rate", gridArea: "3 / 1 / 4 / 4", props: { currentMonth } },
  { id: "generate", name: "extra-hours-pdf", gridArea: "2 / 5 / 3 / 7", props: { title: "Autre" } },
]);

// Drag and Drop
const draggedIndex = ref<number | null>(null);

const onDragStart = (index: number) => {
  draggedIndex.value = index;
};

const onDrop = (index: number) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    const draggedComponent = components.value[draggedIndex.value];
    const targetComponent = components.value[index];

    // Échanger leurs positions dans la grille
    [draggedComponent.gridArea, targetComponent.gridArea] = [
      targetComponent.gridArea,
      draggedComponent.gridArea,
    ];

    draggedIndex.value = null; // Réinitialisation
  }
};

// Calcul des objectifs
const userProfile = computed(() => ({
  weeklyHoursGoal: profileStore.profile?.weeklyHoursGoal || 35,
  workingDaysPerWeek: profileStore.profile?.workingDaysPerWeek || 5,
}));

const dailyWorkGoal = computed(() => {
  return userProfile.value.weeklyHoursGoal / userProfile.value.workingDaysPerWeek * 3600; // En secondes
});

// Gestion des sessions
const fetchSessions = async () => {
  try {
    const response = await $api.get(`/time-entries/date/${selectedDate.value}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    summary.value = response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions :', error);
  }
};

const handleDatePicked = (date: Date) => {
  selectedDate.value = date.toISOString().slice(0, 10);
  fetchSessions();
};

// Mise à jour au chargement
fetchSessions();

// Suivi des changements dans le profil et les objectifs
watch(
  () => profileStore.profile,
  (newProfile) => {
    if (newProfile) console.log('Profil mis à jour :', newProfile);
  },
  { immediate: true }
);
watch(
  () => dailyWorkGoal.value,
  (newGoal) => {
    console.log('Nouvel objectif quotidien :', newGoal);
  }
);
</script>

<style lang="scss" scoped>
.work-sessions {
  margin: $spacing-large;

  &__layout {
    display: grid;
    grid-template-columns: 1fr 1fr 2fr 2fr 1fr 1fr;
    grid-template-rows: 0.5fr 1fr;
    grid-column-gap: $spacing-large;
    grid-row-gap: $spacing-large;

    &--component {
      width: 100%;
      height: 100%
    }

    &--item {
      // border: 1px solid $color-background;
      // border-radius: $border-radius;
      // background-color: $color-surface;
      padding: $spacing-medium;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: grab;

      &:active {
        cursor: grabbing;
      }
    }
  }
}
</style>
