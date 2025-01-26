import { App, createApp, h } from 'vue'
import ToastComponent from './components/Toast.vue'
import { EToast, ETextOverflow, type ToastOptions, type ToastConfig } from './types'

// Export named exports
export { EToast, ETextOverflow }
export type { ToastOptions, ToastConfig }

// Export the component
export const Toast = ToastComponent

let toastInstance: any = null

// Create toast instance
export const createToast = () => {
  const isClient = typeof window !== 'undefined'
  
  // Create Vue app if it doesn't exist and we're on client side
  if (isClient && !toastInstance) {
    const container = document.createElement('div')
    container.id = 'toast-container'
    document.body.appendChild(container)

    const app = createApp(ToastComponent)
    toastInstance = app.mount(container)
  }

  return {
    show: (options: ToastOptions) => {
      if (isClient && toastInstance) {
        console.log('Toast show called with options:', options)
        toastInstance.show(options)
      }
    },
    hide: () => {
      if (isClient && toastInstance) {
        toastInstance.hide()
      }
    },
    configure: (config: ToastConfig) => {
      if (isClient && toastInstance) {
        toastInstance.configure(config)
      }
    }
  }
}

// Export default plugin
export default {
  install: (app: App) => {
    const toast = createToast()
    app.config.globalProperties.$toast = toast
    app.provide('toast', toast)
  }
}
