import { defineNuxtPlugin } from '#app'
import Toast from '~/components/ui/Toast.vue'
import { createVNode, render, nextTick } from 'vue'

interface ToastConfig {
  position?: {
    top?: number;
    right?: number;
  };
  styles?: {
    fontFamily?: string;
    fontSize?: string;
    types?: {
      success?: {
        backgroundColor?: string;
        color?: string;
        borderColor?: string;
      };
      error?: {
        backgroundColor?: string;
        color?: string;
        borderColor?: string;
      };
      warning?: {
        backgroundColor?: string;
        color?: string;
        borderColor?: string;
      };
      info?: {
        backgroundColor?: string;
        color?: string;
        borderColor?: string;
      };
    };
  };
}

interface ToastInstance {
  container: HTMLElement;
  height: number;
}

interface ToastParams {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  dismissible?: boolean;
  icon?: string;
}

export default defineNuxtPlugin((nuxtApp) => {
  const toasts: ToastInstance[] = []
  const TOAST_GAP = 10
  
  // Configuration par défaut
  const config: ToastConfig = {
    position: {
      top: 20,
      right: 20
    },
    styles: {
      fontFamily: 'inherit',
      fontSize: '0.95rem',
      types: {
        success: {
          backgroundColor: '#4caf50',
          color: '#ffffff',
          borderColor: '#43a047'
        },
        error: {
          backgroundColor: '#f44336',
          color: '#ffffff',
          borderColor: '#e53935'
        },
        warning: {
          backgroundColor: '#ff9800',
          color: '#ffffff',
          borderColor: '#fb8c00'
        },
        info: {
          backgroundColor: '#2196f3',
          color: '#ffffff',
          borderColor: '#1e88e5'
        }
      }
    }
  }

  const updateToastPositions = async () => {
    let currentTop = config.position?.top || 20
    
    await nextTick()
    
    for (const toast of toasts) {
      const toastElement = toast.container.firstElementChild as HTMLElement
      if (toastElement) {
        toastElement.style.top = `${currentTop}px`
        toast.height = toastElement.offsetHeight
        currentTop += toast.height + TOAST_GAP
      }
    }
  }

  const toast = {
    configure(newConfig: ToastConfig) {
      // Fusion profonde de la configuration
      if (newConfig.styles?.types) {
        config.styles = config.styles || {}
        config.styles.types = config.styles.types || {}
        for (const type in newConfig.styles.types) {
          config.styles.types[type] = {
            ...config.styles.types[type],
            ...newConfig.styles.types[type]
          }
        }
      }
      if (newConfig.position) {
        config.position = { ...config.position, ...newConfig.position }
      }
      if (newConfig.styles?.fontFamily) {
        config.styles.fontFamily = newConfig.styles.fontFamily
      }
      if (newConfig.styles?.fontSize) {
        config.styles.fontSize = newConfig.styles.fontSize
      }
    },

    getConfig() {
      return config
    },

    show(params: ToastParams) {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const toastInstance = createVNode(Toast, {
        ...params,
        position: config.position?.top || 20,
        right: config.position?.right || 20,
        styles: config.styles,
        onMounted: async () => {
          await nextTick()
          const toastElement = container.firstElementChild as HTMLElement
          if (toastElement) {
            const height = toastElement.offsetHeight
            toasts.unshift({ container, height })
            await updateToastPositions()
          }
        },
        onClose: async () => {
          const index = toasts.findIndex(t => t.container === container)
          if (index > -1) {
            toasts.splice(index, 1)
            await updateToastPositions()
          }
          render(null, container)
          document.body.removeChild(container)
        }
      })

      render(toastInstance, container)
    }
  }

  return {
    provide: {
      toast
    }
  }
})
