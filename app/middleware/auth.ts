export default defineNuxtRouteMiddleware((to, from) => {
  // Ambil cookie yang berisi token, user, dan permissions
  const token = useCookie('token')
  const user = useCookie('user')
  const permissions = useCookie('permissions')

  // Jika tidak ada token atau user, arahkan ke halaman login
  if (!token.value || !user.value) {
    return navigateTo('/auth/login')
  }

  let userPermissions = []
  try {
    // Jika permissions adalah object, langsung gunakan tanpa JSON.parse
    if (permissions.value && typeof permissions.value === 'object') {
      userPermissions = Array.isArray(permissions.value)
        ? permissions.value.map(p => p.slug)
        : []
    }
    else if (permissions.value && typeof permissions.value === 'string') {
      // Jika berbentuk string, parse menjadi object/array
      const parsedPermissions = JSON.parse(permissions.value)

      if (Array.isArray(parsedPermissions)) {
        userPermissions = parsedPermissions.map(p => p.slug)
      }
      else {
      }
    }
    else {
    }
  }
  catch (error) {
  }

  // Jika route memerlukan izin tertentu, periksa apakah user memiliki izin tersebut
  if (to.meta.requiredPermission) {
    const requiredPermission = to.meta.requiredPermission
    if (!userPermissions.includes(requiredPermission)) {
      return navigateTo('/auth/access') // Arahkan ke halaman akses ditolak
    }
  }
})
