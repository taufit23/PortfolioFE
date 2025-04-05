// composables/useItemLoading.ts
export const useItemLoading = () => {
  const loadingMap = ref<Record<number, boolean>>({})

  const setLoading = (id: number, state: boolean) => {
    loadingMap.value[id] = state
  }

  return {
    loadingMap,
    setLoading,
  }
}
