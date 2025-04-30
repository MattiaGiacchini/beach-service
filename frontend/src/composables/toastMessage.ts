import type { ToastPayload } from '@/plugins/toastBus'
import { toastBus } from '@/plugins/toastBus'

export function useToastMessage() {
  function showToast(
    severity: ToastPayload['severity'],
    summary: string,
    detail: string,
    life: number = 3000
  ): void {
    toastBus.emit('toast', { severity, summary, detail, life })
  }

  const showErrorToast = (error: any) => {
    const payload: ToastPayload = {
      severity: 'error',
      summary: 'Error',
      detail: error?.message || 'Unexpected error'
    }
    toastBus.emit('toast', payload)
  }

  const showSuccessToast = (message: string) => {
    const payload: ToastPayload = {
      severity: 'success',
      summary: 'Success',
      detail: message || 'OK'
    }
    toastBus.emit('toast', payload)
  }

  return { showToast, showErrorToast, showSuccessToast }
}
