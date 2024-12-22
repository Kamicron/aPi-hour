<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal" @click.self="closeModal">
      <div class="modal__content">
        <header class="modal__header">
          <p class="modal__header--text">{{ title }}</p>
          <div class="modal__close" @click="closeModal">
            <i class="fa-solid fa-xmark"></i>
          </div>
        </header>

        <div class="modal__slot">
          <slot></slot>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: { type: String, default: "Information" }
});

// Emits
const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
  }
);

function closeModal() {
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &__header {
    padding-bottom: $spacing-large;
    border-bottom: 1px solid $color-text-secondary;

    &--text {
      color: $color-primary-light;
      font-size: $font-size-large;
      font-weight: bold;
    }
  }

  &__slot {
    margin-top: 20px;
  }

  &__content {
    background-color: $color-surface;
    border-radius: $border-radius;
    box-shadow: $box-shadow-light;
    padding: $spacing-unit $spacing-large $spacing-large $spacing-large;
    position: relative;
    max-width: 500px;
    width: 90%;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  &__close {
    position: absolute;
    top: $spacing-small;
    right: $spacing-small;
    background-color: transparent;
    font-size: 1rem;
    cursor: pointer;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
    border-radius: 50%;
    transition: background-color 0.3s ease, transform 0.3s ease;
    box-shadow: $box-shadow-light;

    &:hover {
      background-color: $color-danger;
      color: $color-text-primary;
      transform: scale(1.1);
    }
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
