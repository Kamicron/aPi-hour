<template>
  <div class="custom-checkbox">
    <!-- Input natif masqué -->
    <input
      type="checkbox"
      :id="id"
      class="custom-checkbox__input"
      :value="value"
      v-model="internalValue"
      :disabled="disabled"
    />
    <!-- Label stylisé -->
    <label :for="id" class="custom-checkbox__label">
      <span class="custom-checkbox__box">
        <!-- Icône SVG pour la coche -->
        <svg
          class="custom-checkbox__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <!-- Texte -->
      <span class="custom-checkbox__text">
        <slot />
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  id: {
    type: String,
    required: true, // Un ID unique pour chaque checkbox
  },
  modelValue: {
    type: [Boolean, Array],
    default: false, // Peut être un booléen ou un tableau
  },
  value: {
    type: [String, Number, Boolean],
    default: true, // Valeur spécifique pour cette checkbox
  },
  disabled: {
    type: Boolean,
    default: false, // Permet de désactiver la checkbox
  },
});

const emit = defineEmits(["update:modelValue"]);

const internalValue = computed({
  get() {
    if (Array.isArray(props.modelValue)) {
      // Si le modelValue est un tableau, retourne true si la valeur est dans la liste
      return props.modelValue.includes(props.value);
    }
    return props.modelValue; // Sinon, retourne la valeur booléenne
  },
  set(newValue) {
    if (Array.isArray(props.modelValue)) {
      let newArray = [...props.modelValue];
      if (newValue) {
        // Ajouter la valeur au tableau si elle n'existe pas déjà
        if (!newArray.includes(props.value)) newArray.push(props.value);
      } else {
        // Retirer la valeur du tableau si elle existe
        newArray = newArray.filter((item) => item !== props.value);
      }
      emit("update:modelValue", newArray);
    } else {
      // Si ce n'est pas un tableau, mettre à jour directement la valeur booléenne
      emit("update:modelValue", newValue);
    }
  },
});
</script>

<style lang="scss" scoped>
@use "sass:color";

.custom-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  &__input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &__label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: $font-size-small;
    color: $color-text-primary;

    &:hover .custom-checkbox__box {
      border-color: $color-primary-light;
    }
  }

  &__box {
    width: 20px;
    height: 20px;
    border: 2px solid $color-primary-light;
    border-radius: $border-radius;
    background-color: $color-background;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: $spacing-small;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  &__icon {
    width: 12px;
    height: 12px;
    color: $color-text-primary;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &__input:checked + .custom-checkbox__label .custom-checkbox__box {
    background-color: $color-primary;
    border-color: $color-primary;

    .custom-checkbox__icon {
      opacity: 1;
    }
  }

  &__input:focus + .custom-checkbox__label .custom-checkbox__box {
    border-color: $color-secondary;
    box-shadow: $box-shadow-light;
  }

  &__input:disabled + .custom-checkbox__label .custom-checkbox__box {
    background-color: color.scale($color-background, $lightness: 10%);
    border-color: $color-surface;
    cursor: not-allowed;
    opacity: 0.6;
  }

  &__text {
    user-select: none;
  }
}
</style>
