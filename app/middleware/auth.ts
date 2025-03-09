export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie("token");
    const user = useCookie("user");
    const permissions = useCookie("permissions");

    if (!token.value || !user.value)
    {
        return navigateTo("/auth/login");
    }

    let userPermissions = [];
    try
    {
        userPermissions = JSON.parse(permissions.value || "[]").map((p) => p.slug);
    } catch (error)
    {
        console.error("Error parsing permissions:", error);
    }

    if (to.meta.requiredPermission)
    {
        const requiredPermission = to.meta.requiredPermission;
        if (!userPermissions.includes(requiredPermission))
        {
            return navigateTo("/auth/access");
        }
    }
});
