// composables/useStringUtils.ts
export const useStringUtils = () => {
  const truncate = (text: string, length: number) =>
    text.length > length ? text.substring(0, length) + '...' : text

  return { truncate }
}
