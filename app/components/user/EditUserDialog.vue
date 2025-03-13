<script setup>
    // components/user/editUserDialog.vue
    import {
        defineProps,
        defineEmits
    } from 'vue'

    // Props dari parent
    const props = defineProps({
        visible: Boolean, // Status dialog (open/close)
        user: Object, // Data user yang akan diedit
        roles: Array, // Daftar roles
        permissions: Array // Daftar permissions
    })

    // Emit event ke parent
    const emit = defineEmits(['update:visible', 'save-user'])

    // Fungsi untuk menutup dialog
    function closeDialog() {
        emit('update:visible', false)
    }

    // Fungsi untuk menyimpan user
    function saveUser() {
        emit('save-user', props.user)
    }
</script>

<template>
    <Dialog v-model:visible="props.visible" :style="{ width: '50vw' }" header="Edit User" :modal="true">
        <div v-if="user" class="flex flex-col gap-4">
            <label for="username">Username</label>
            <InputText id="username" v-model="user.username" />

            <label for="name">Name</label>
            <InputText id="name" v-model="user.name" />

            <label for="email">Email</label>
            <InputText id="email" v-model="user.email" />

            <label for="roles">Roles</label>
            <MultiSelect id="roles" v-model="user.roles" :options="roles" option-label="role_name"
                option-value="id" placeholder="Select roles" :disabled="user.use_default_roles" />

            <div class="flex items-center gap-2">
                <Checkbox id="use_custom_permissions" v-model="user.use_custom_permissions" :binary="true" />
                <label for="use_custom_permissions">Use Custom Permissions</label>
            </div>

            <label for="permissions">Permissions</label>
            <MultiSelect id="permissions" v-model="user.permissions" :options="permissions"
                option-label="permision_name" option-value="id" placeholder="Select permissions"
                :disabled="!user.use_custom_permissions" />
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="closeDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveUser" />
        </template>
    </Dialog>
</template>
