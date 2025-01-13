<template>
  <div class="index">
    <client-only>
      <div class="work-sessions">
        <grid-layout v-model:layout="components" :col-num="12" :row-height="30" :is-draggable="true"
          :is-resizable="true" :vertical-compact="true" :use-css-transforms="true" @layout-updated="onLayoutUpdated">
          <grid-item v-for="component in components" :key="component.i" :x="component.x" :y="component.y"
            :w="component.w" :h="component.h" :i="component.i" drag-allow-from=".vue-draggable-handle"
            drag-ignore-from=".no-drag">
            <div class="work-sessions__layout--item">
              <div class="vue-draggable-handle">
                <i class="vue-draggable-handle__icon fa-solid fa-up-down-left-right"></i>
              </div>
              <div class="no-drag">
                <component class="work-sessions__layout--component" :is="componentsMap[component.name]"
                  v-bind="getComponentProps(component)" @pick-date="handleDatePick" />
              </div>
            </div>
          </grid-item>
        </grid-layout>

        <v-btn color="primary" class="save-layout-btn" @click="saveLayoutToServer" :loading="isSaving">
          <i class="fas fa-save mr-2"></i>
          Sauvegarder la disposition
        </v-btn>
      </div>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import "assets/styles/vue-grid-layout.css";
import { ref, onMounted } from "vue";
import Calendar from '../components/sessions/calendar.vue';
import ResumeSession from '../components/sessions/resume-session.vue';
import ExtraHoursDisplay from '../components/sessions/extra-hours-display.vue';
import SetVacation from '../components/vacation/set_vacation.vue';
import ExtraHoursRate from '../components/sessions/extra-hours-rate.vue';
import ExtraHoursPdf from '../components/sessions/extra-hours-pdf.vue';
import { useUserStore } from '~/stores/user';
import { useNuxtApp, useCookie } from '#app';

const userStore = useUserStore();
const { $api } = useNuxtApp();
const token = useCookie('token');
const isSaving = ref(false);
const selectedDate = ref(null);

const componentsMap = {
  calendar: Calendar,
  "resume-session": ResumeSession,
  "extra-hours-display": ExtraHoursDisplay,
  "set_vacation": SetVacation,
  "extra-hours-rate": ExtraHoursRate,
  "extra-hours-pdf": ExtraHoursPdf,
};

const getInitialComponents = () => [
  { id: "calendar", name: "calendar", x: 0, y: 0, w: 4, h: 16, i: "calendar", props: {} },
  { id: "resume", name: "resume-session", x: 4, y: 0, w: 5, h: 16, i: "resume", props: { selectedDate: selectedDate.value } },
  { id: "display", name: "extra-hours-display", x: 9, y: 0, w: 3, h: 9, i: "display", props: {} },
  { id: "vacation", name: "set_vacation", x: 7, y: 16, w: 5, h: 8, i: "vacation", props: {} },
  { id: "rate", name: "extra-hours-rate", x: 0, y: 16, w: 7, h: 8, i: "rate", props: { currentMonth: null } },
  { id: "generate", name: "extra-hours-pdf", x: 9, y: 9, w: 3, h: 7, i: "generate", props: { title: "Autre" } },
];

const components = ref(getInitialComponents());

const handleDatePick = (date: Date) => {
  selectedDate.value = date;
  // Mettre à jour les props du composant resume-session
  const resumeComponent = components.value.find(c => c.id === "resume");
  if (resumeComponent) {
    resumeComponent.props = { ...resumeComponent.props, selectedDate: date };
  }

  console.log('selectedDate', selectedDate.value);
};

const getComponentProps = (component) => {
  if (component.name === "resume-session") {
    return { ...component.props, selectedDate: selectedDate.value };
  }
  return component.props;
};

const onLayoutUpdated = (newLayout) => {
  components.value = newLayout.map((item, index) => {
    const comp = { ...components.value[index] };
    comp.x = item.x;
    comp.y = item.y;
    comp.w = item.w;
    comp.h = item.h;
    // Préserver les props mis à jour
    if (comp.name === "resume-session") {
      comp.props = { ...comp.props, selectedDate: selectedDate.value };
    }
    return comp;
  });
  if (process.client) {
    localStorage.setItem('dashboardLayout', JSON.stringify(components.value));
  }
};

const saveLayoutToServer = async () => {
  try {
    isSaving.value = true;
    await userStore.saveDashboardLayout($api, components.value);
    alert('Disposition sauvegardée avec succès');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    alert('Erreur lors de la sauvegarde de la disposition');
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  if (process.client) {
    let loadedComponents;
    // Essayer de charger depuis le profil utilisateur
    if (userStore.profile?.dashboardLayout) {
      loadedComponents = userStore.profile.dashboardLayout;
    } else {
      // Fallback vers localStorage
      const savedLayout = localStorage.getItem('dashboardLayout');
      if (savedLayout) {
        loadedComponents = JSON.parse(savedLayout);
      }
    }

    if (loadedComponents) {
      // S'assurer que les props sont correctement initialisés
      components.value = loadedComponents.map(comp => {
        if (comp.name === "resume-session") {
          return { ...comp, props: { ...comp.props, selectedDate: selectedDate.value } };
        }
        return comp;
      });
    }
  }
});
</script>

<style lang="scss" scoped>
.work-sessions {
  position: relative;
  height: 100%;
  width: 100%;

  &__layout {

    &--item {
      height: 100% !important;
      width: 100% !important;

      .no-drag {
        height: 100%;
        width: 100%;
      }
    }

    &--component {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }
  }
}

.index {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  :deep(.vue-grid-item .vue-resizable-handle) {
    border-bottom: 2px solid $color-secondary;
    border-right: 2px solid $color-secondary;
    width: 15px;
    height: 15px;
    margin: $spacing-medium;
    border-radius: 2px;

    :hover {
      border: $color-primary;
    }
  }

  :deep(.vue-grid-item.vue-grid-placeholder) {
    background: green;
  }

  .vue-grid-item:not(.vue-grid-placeholder) {
    background-color: $color-surface;
    color: $color-text-primary;
    padding: $spacing-large;
    border-radius: $border-radius;
  }

  .vue-grid-item.static {
    background: #cce;
  }

  .vue-grid-item .text {
    font-size: 24px;
    text-align: center;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    height: 100%;
    width: 100%;
  }
}

.grid-layout {
  background-color: #f8f9fa;
}

.text {
  background-color: #ddd;
  display: block;
  text-align: center;
  font-size: 16px;
  color: #333;
}

.vue-draggable-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 30px;
  height: 30px;
  top: 5px;
  left: 5px;
  background-repeat: no-repeat;
  background-origin: content-box;
  background-color: $color-background;
  box-sizing: border-box;
  border-radius: 15px;
  cursor: pointer;

  &__icon {
    font-size: 16px;
    color: $color-primary;
  }
}

.vgl-layout {
  --vgl-placeholder-bg: yellow;
  --vgl-placeholder-opacity: 20%;
  --vgl-placeholder-z-index: 2;

  --vgl-item-resizing-z-index: 3;
  --vgl-item-resizing-opacity: 60%;
  --vgl-item-dragging-z-index: 3;
  --vgl-item-dragging-opacity: 100%;

  --vgl-resizer-size: 10px;
  --vgl-resizer-border-color: #444;
  --vgl-resizer-border-width: 2px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.save-layout-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
