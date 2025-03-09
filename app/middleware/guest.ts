// permisions/guest.ts
export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('token').value;

    if (token)
    {
        return navigateTo('/authenticated/dashboard');
    }
});
