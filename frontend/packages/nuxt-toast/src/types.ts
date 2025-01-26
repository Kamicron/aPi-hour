export enum EToast {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export enum ETextOverflow {
  ELLIPSIS = 'ellipsis',
  WRAP = 'wrap'
}

export interface ToastOptions {
  message: string
  type?: EToast
  duration?: number
  dismissible?: boolean
  icon?: string
}

export interface ToastInstance {
  show: (options: ToastOptions) => void
  hide: () => void
}

export interface ToastTypeStyles {
  backgroundColor: string
  color: string
  borderColor: string
}

export interface ToastPosition {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface ToastStyles {
  fontFamily?: string
  fontSize?: string
  borderRadius?: string
  boxShadow?: string
  width?: string
  maxHeight?: string
  textOverflow?: ETextOverflow
  types?: {
    [key in EToast]?: ToastTypeStyles
  }
}

export interface ToastConfig {
  position?: ToastPosition
  styles?: ToastStyles
}

// Type pour augmenter l'interface Vue
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: ToastInstance
  }
}
