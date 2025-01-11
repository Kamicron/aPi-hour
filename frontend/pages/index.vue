<template>
  <div class="index">
    <client-only>
      <grid-layout
        :layout.sync="components"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :responsive="true"
        :is-bounded="true"
        :vertical-compact="true"
        :use-css-transforms="true"

        @layout-updated="onLayoutUpdated"
      >
        <grid-item
          v-for="(component, index) in components"
          :key="component.id"
          :x="component.x"
          :y="component.y"
          :w="component.w"
          :h="component.h"
          :i="component.i"
          drag-allow-from=".vue-draggable-handle"
          drag-ignore-from=".no-drag"
        >
        <div class="work-sessions__layout--item">
          <div class="vue-draggable-handle">
            <i class="vue-draggable-handle__icon fa-solid fa-up-down-left-right"></i>
          </div>
          <div class="no-drag">
            <component class="work-sessions__layout--component" :is="componentsMap[component.name]" v-bind="component.props" />
            <!-- {{ component.x }} {{ component.y }} {{ component.w }} {{ component.h }} -->
          </div>
        </div>
      </grid-item>
      </grid-layout>
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

const componentsMap = {
  calendar: Calendar,
  "resume-session": ResumeSession,
  "extra-hours-display": ExtraHoursDisplay,
  "set_vacation": SetVacation,
  "extra-hours-rate": ExtraHoursRate,
  "extra-hours-pdf": ExtraHoursPdf,
};

const components = ref([
  { id: "calendar", name: "calendar", x: 0, y: 0, w: 4, h: 16, i: "calendar", props: {} },
  { id: "resume", name: "resume-session", x: 4, y: 0, w: 5, h: 16, i: "resume", props: { selectedDate: null } },
  { id: "display", name: "extra-hours-display", x: 9, y: 0, w: 3, h: 9, i: "display", props: {} },
  { id: "vacation", name: "set_vacation", x: 7, y: 16, w: 5, h: 8, i: "vacation", props: {} },
  { id: "rate", name: "extra-hours-rate", x: 0, y: 16, w: 7, h: 8, i: "rate", props: { currentMonth: null } },
  { id: "generate", name: "extra-hours-pdf", x: 9, y: 9, w: 3, h: 7, i: "generate", props: { title: "Autre" } },
]);

const onLayoutUpdated = (newLayout) => {
  components.value = newLayout.map((item, index) => ({
    ...components.value[index],
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  }));
  if (process.client) {
    localStorage.setItem('dashboardLayout', JSON.stringify(components.value));
  }
};

onMounted(() => {
  if (process.client) {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      components.value = JSON.parse(savedLayout);
    }
  }
});
</script>

<style lang="scss" scoped>
.work-sessions {
  &__layout {
   &--component {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;



    &--item {
      height:  100%;
      width: 100%;
    }

    .no-drag {
      height:  100%;
      width: 100%;
    }
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
      // background: #ccc;
      // border: 1px solid black;
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
</style>
