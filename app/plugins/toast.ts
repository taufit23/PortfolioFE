// plugins/toast.ts
export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast()

  type ToastType = 'success' | 'error' | 'warn' | 'info'

  const showToast = (type: ToastType, title: string, message: string, duration: number = 3000) => {
    toast.add({
      severity: type,
      summary: title,
      detail: message,
      life: duration,
    })
  }

  nuxtApp.provide('showToast', showToast)
})
