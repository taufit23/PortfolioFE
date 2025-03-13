<script setup>
    import {
        defineProps,
        defineEmits,
        ref
    } from 'vue';

    // Props untuk menerima data dari parent
    const props = defineProps({
        visible: Boolean, // Status dialog (open/close)
        roles: Array, // Daftar roles yang tersedia
        permissions: Array, // Daftar permissions yang tersedia
    });

    // Emit untuk komunikasi dengan parent
    const emit = defineEmits(['update:visible', 'save-user']);

    // State untuk user baru
    const newUser = ref({
        username: '',
        email: '',
        name: '',
        password: '',
        password_confirmation: '',
        use_default_password: false,
        use_default_roles: false,
        roles: [], // Akan diisi dengan id dari roles
        use_custom_permissions: false,
        permissions: [], // Akan diisi dengan id dari permissions
    });

    // Function untuk menyimpan user baru
    function saveUser() {
        emit('save-user', newUser.value);
    }

    // Function untuk menutup dialog
    function closeDialog() {
        emit('update:visible', false);
    }
</script>

<template>
    <Dialog v-model:visible="props.visible" :style="{ width: '50vw' }" header="Create User" :modal="true">
        <div class="flex flex-col gap-4">
            <!-- Username -->
            <label for="username">Username</label>
            <InputText id="username" v-model="newUser.username" />

            <!-- Name -->
            <label for="name">Name</label>
            <InputText id="name" v-model="newUser.name" />

            <!-- Email -->
            <label for="email">Email</label>
            <InputText id="email" v-model="newUser.email" />

            <!-- Password -->
            <label for="password">Password</label>
            <InputText id="password" v-model="newUser.password" type="password"
                :disabled="newUser.use_default_password" />

            <!-- Password Confirmation -->
            <label for="password_confirmation">Confirm Password</label>
            <InputText id="password_confirmation" v-model="newUser.password_confirmation" type="password"
                :disabled="newUser.use_default_password" />

            <!-- Use Default Password -->
            <div class="flex items-center gap-2">
                <Checkbox id="use_default_password" v-model="newUser.use_default_password" :binary="true" />
                <label for="use_default_password">Use Default Password</label>
            </div>

            <!-- Use Default Roles -->
            <div class="flex items-center gap-2">
                <Checkbox id="use_default_roles" v-model="newUser.use_default_roles" :binary="true" />
                <label for="use_default_roles">Use Default Roles</label>
            </div>

            <!-- Roles Selection -->
            <label for="roles">Roles</label>
            <MultiSelect id="roles" v-model="newUser.roles" :options="props.roles" option-label="role_name"
                option-value="id" placeholder="Select roles" :disabled="newUser.use_default_roles" />

            <!-- Use Custom Permissions -->
            <div class="flex items-center gap-2">
                <Checkbox id="use_custom_permissions" v-model="newUser.use_custom_permissions" :binary="true" />
                <label for="use_custom_permissions">Use Custom Permissions</label>
            </div>

            <!-- Permissions Selection -->
            <label for="permissions">Permissions</label>
            <MultiSelect id="permissions" v-model="newUser.permissions" :options="props.permissions"
                option-label="permision_name" option-value="id" placeholder="Select permissions"
                :disabled="!newUser.use_custom_permissions" />
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="closeDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveUser" />
        </template>
    </Dialog>
</template>
