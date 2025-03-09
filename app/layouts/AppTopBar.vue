<script setup>
    import {
        useLayout
    } from './composables/layout'
    import {
        useCookie
    } from '#app'

    const {
        onMenuToggle,
        toggleDarkMode,
        isDarkTheme
    } = useLayout()
    const outsideClickListener = ref(null)
    const topbarMenuActive = ref(false)
    const profileMenuActive = ref(false)
    const profileMenu = ref(null) // 🔥 Tambahkan ref untuk profile menu


    onMounted(() => bindOutsideClickListener())
    onBeforeUnmount(() => unbindOutsideClickListener())

    const onTopBarMenuButton = () => (topbarMenuActive.value = !topbarMenuActive.value)
    const onProfileClick = () => (profileMenuActive.value = !profileMenuActive.value)

    const token = useCookie('token')
    const user = useCookie('user')
    const permissions = useCookie('permissions') // 🔥 Tambahkan kalau ada

    const logout = () => {
        token.value = null
        user.value = null
        permissions.value = null // 🔥 Hapus juga permissions kalau ada
        navigateTo('/auth/login')
    }

    const topbarMenuClasses = computed(() => ({
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    }));

    const bindOutsideClickListener = () => {
        if (!outsideClickListener.value) {
            outsideClickListener.value = (event) => {
                if (isOutsideClicked(event)) {
                    topbarMenuActive.value = false
                    profileMenuActive.value = false
                }
            }
            document.addEventListener('mousedown', outsideClickListener.value) // 🔥 Ganti 'click' ke 'mousedown'
        }
    };

    const unbindOutsideClickListener = () => {
        if (outsideClickListener.value) {
            document.removeEventListener('mousedown', outsideClickListener.value)
            outsideClickListener.value = null
        }
    };

    // 🔥 Fix isOutsideClicked supaya lebih akurat
    const isOutsideClicked = (event) => {
        if (!topbarMenuActive.value && !profileMenuActive.value) return false

        const topbarEl = document.querySelector('.layout-topbar-menu-button')
        const profileMenuEl = profileMenu.value // 🔥 Pakai ref supaya nggak null

        return (
            !event.composedPath().includes(topbarEl) &&
            !event.composedPath().includes(profileMenuEl)
        )
    };
</script>

<template>
    <div class="layout-topbar">
        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars" />
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v" />
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button type="button" class="layout-topbar-button" @click="toggleDarkMode">
                <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]" />
                <span>Dark Mode</span>
            </button>
            <button as="router-link" class="layout-topbar-button" @click="onTopBarMenuButton()">
                <i class="pi pi-calendar" />
                <span>Calendar</span>
            </button>

            <div class="relative">
                <button class="layout-topbar-button" @click="onProfileClick">
                    <i class="pi pi-user" />
                    <span>Profile</span>
                </button>
                <div v-if="profileMenuActive" ref="profileMenu"
                    class="profile-menu absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2">
                    <NuxtLink to="/authenticated/profile"
                        class="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100">
                        <i class="pi pi-user" />
                        <span>Profile</span>
                    </NuxtLink>
                    <button class="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                        @click="logout">
                        <i class="pi pi-sign-out" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
    .profile-menu {
        z-index: 1050;
    }
</style>
