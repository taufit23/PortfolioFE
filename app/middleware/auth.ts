export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('token'); // Cek token dari cookie
    const user = useCookie('user'); // Cek user dari cookie
    const permissions = useCookie('permissions'); // Ambil permissions

    if (!token.value || !user.value)
    {
        return navigateTo('/auth/login'); // Redirect kalau belum login
    }

    // Opsional: Kalau mau cek permission buat route tertentu, bisa pakai meta
    if (to.meta.requiredPermission)
    {
        const requiredPermission = to.meta.requiredPermission;
        if (!permissions.value?.includes(requiredPermission))
        {
            return navigateTo('/auth/access'); // Redirect kalau nggak punya izin
        }
    }
});
