<!-- Toast.vue -->
<template>
  <Transition 
    name="toast"
    @after-leave="afterLeave">
    <div v-if="isVisible" 
         ref="toastRef"
         class="toast-container"
         :style="containerStyle">
      <div class="toast-content">
        <span class="toast-icon" v-if="icon" :style="textStyle">{{ icon }}</span>
        <span class="toast-message" :style="textStyle">{{ message }}</span>
      </div>
      <button v-if="dismissible" 
              @click="hide" 
              class="toast-close"
              :style="textStyle">
        ×
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { EToast } from '~/assets/ts/enums/toast.enum'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String as () => EToast,
    default: EToast.INFO,
    validator: (value: string) => Object.values(EToast).includes(value as EToast)
  },
  duration: {
    type: Number,
    default: 3000
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: ''
  },
  position: {
    type: Number,
    required: true
  },
  right: {
    type: Number,
    required: true
  },
  styles: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'mounted'])

const isVisible = ref(false)
let timer: NodeJS.Timeout | null = null

const typeStyles = computed(() => {
  return props.styles.types?.[props.type] || {}
})

const containerStyle = computed(() => ({
  backgroundColor: `${typeStyles.value.backgroundColor} !important`,
  borderColor: `${typeStyles.value.borderColor} !important`,
  fontFamily: `${props.styles.fontFamily} !important`,
  fontSize: `${props.styles.fontSize} !important`,
  top: `${props.position}px`,
  right: `${props.right}px`
}))

const textStyle = computed(() => ({
  color: `${typeStyles.value.color} !important`
}))

const hide = () => {
  isVisible.value = false
}

const afterLeave = () => {
  if (timer) {
    clearTimeout(timer)
  }
  emit('close')
}

const show = () => {
  isVisible.value = true
  if (props.duration > 0) {
    timer = setTimeout(hide, props.duration)
  }
}

onMounted(() => {
  show()
  emit('mounted')
})

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  min-width: 300px;
  max-width: 80%;
  padding: 1rem;
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-grow: 1;
}

.toast-icon {
  font-size: 1.2em;
}

.toast-message {
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
  padding: 0 0.5rem;
  opacity: 0.7;
  margin-left: 1rem;
  transition: opacity 0.2s ease;
}

.toast-close:hover {
  opacity: 1;
}

/* Animation */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}
</style>
