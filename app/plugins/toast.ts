export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast()

  const showToast = (severity, summary, detail) => {
    toast.add({
      severity,
      summary,
      detail,
      life: 3000,
    })
  }

  nuxtApp.provide('showToast', showToast)
})
