import { inject } from 'vue'

export function useToastMessage() {
  const toast = inject('toast')

  function showToast(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string,
    life: number = 3000
  ): void {
    toast?.add({
      severity,
      summary,
      detail,
      life
    })
  }

  const showErrorToast = (error: any) => {
    toast?.add({ severity: 'error', summary: 'Error', detail: error.message || 'Error inesperado' })
  }

  return { showToast, showErrorToast }
}
