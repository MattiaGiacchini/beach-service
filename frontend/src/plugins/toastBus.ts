import mitt from 'mitt'

export type ToastPayload = {
  severity: 'success' | 'info' | 'warn' | 'error'
  summary: string
  detail: string
  life?: number
}

type Events = {
  toast: ToastPayload
}

export const toastBus = mitt<Events>()
