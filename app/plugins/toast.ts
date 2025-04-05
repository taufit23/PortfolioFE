export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast()

  const showToast = (severity: any, summary: any, detail: any) => {
    toast.add({
      severity,
      summary,
      detail,
      life: 3000,
    })
  }

  nuxtApp.provide('showToast', showToast)
})
