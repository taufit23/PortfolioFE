<script setup>
    const {
        $showToast
    } = useNuxtApp();
    const onThrow = () => {
        throw createError({
            statusCode: 500,
            statusMessage: "This is a test error",
            fatal: true,
        });
    };

    const showToast = () => {
        $showToast("error", "Error", 'Test Error Toast');
    };

    definePageMeta({
        layout: "authenticated",
        middleware: "auth",
    });
</script>

<template>
    <div class="card">
        <h2>Main page</h2>
        <div class="flex flex-col gap-6 my-8">
            <h4>Nuxt - Vue Pages</h4>
            <div class="flex flex-wrap gap-6 w-1/6">
                <Button severity="contrast" @click="navigateTo('/this-page-does-not-exist')" label="Not Found Page" />

                <Button label="Throw Error" severity="danger" @click="onThrow" />
                <Button label="Show Toast" severity="info" @click="showToast" />
            </div>
            <h4 class="mt-10">Auth Pages</h4>

            <div class="flex flex-wrap gap-6 w-1/6">
                <Button severity="warn" as="router-link" to="/auth/access" label="Unauthorized Page" />
                <Button as="router-link" to="/auth/login" label="Login Page" />
            </div>
        </div>
    </div>
</template>
