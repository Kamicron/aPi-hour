<template>
  <modal 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title"
  >
    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="form">
        <div class="input">
          <label :for="startId" class="form__label">Début :</label>
          <input 
            type="time" 
            :id="startId" 
            v-model="startTime" 
            required 
            class="pi-input" 
          />
        </div>

        <div class="input">
          <label :for="endId" class="form__label">Fin :</label>
          <input 
            type="time" 
            :id="endId" 
            v-model="endTime" 
            :required="isEndRequired"
            class="pi-input" 
          />
        </div>

        <div class="form__actions">
          <button type="submit" class="btn btn--success">
            <i class="fa-solid fa-check"></i> {{ submitLabel }}
          </button>
          <button type="button" class="btn btn--outline" @click="$emit('update:modelValue', false)">
            <i class="fa-solid fa-xmark"></i> Annuler
          </button>
        </div>
      </form>
    </div>
  </modal>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    required: true,
    validator: (value: string) => ['add-pause', 'edit-pause', 'edit-session'].includes(value)
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  isEndRequired: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'submit']);

// Computed properties for dynamic content
const title = computed(() => {
  switch (props.mode) {
    case 'add-pause':
      return 'Ajouter une pause';
    case 'edit-pause':
      return 'Modifier la pause';
    case 'edit-session':
      return 'Modifier la session';
    default:
      return '';
  }
});

const submitLabel = computed(() => {
  switch (props.mode) {
    case 'add-pause':
      return 'Ajouter';
    case 'edit-pause':
    case 'edit-session':
      return 'Modifier';
    default:
      return 'Enregistrer';
  }
});

const startId = computed(() => `${props.mode}-start`);
const endId = computed(() => `${props.mode}-end`);

// Form data
const startTime = ref('');
const endTime = ref('');

// Initialize form data
onMounted(() => {
  if (props.initialData) {
    const formatTime = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    if (props.mode === 'edit-session') {
      startTime.value = props.initialData.startTime || '';
      endTime.value = props.initialData.endTime || '';
    } else {
      startTime.value = formatTime(props.initialData.pauseStart);
      endTime.value = formatTime(props.initialData.pauseEnd);
    }
  }
});

function handleSubmit() {
  emit('submit', {
    startTime: startTime.value,
    endTime: endTime.value
  });
}
</script>

<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;

  &__label {
    margin-bottom: $spacing-small;
    font-size: $font-size-small;
    color: $color-text-secondary;
  }

  .input {
    display: flex;
    flex-direction: column;
    gap: $spacing-small;
  }

  &__actions {
    display: flex;
    gap: $spacing-medium;
    justify-content: flex-end;
    margin-top: $spacing-medium;
  }
}
</style>
