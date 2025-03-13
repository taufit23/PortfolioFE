<script setup>
    //component/createRoleDialog.vue
    import {
        defineProps,
        defineEmits,
        ref
    } from 'vue';

    const props = defineProps({
        visible: Boolean,
        permissions: Array,
    });

    // Emit untuk komunikasi dengan parent
    const emit = defineEmits(['update:visible', 'save-role']);

    const newRole = ref({
        role_name: '',
        role_desc: '',
        permissions: [], // Akan diisi dengan id dari permissions
    });

    function saveRole() {
        emit('save-role', newRole.value);
    }

    // Function untuk menutup dialog
    function closeDialog() {
        emit('update:visible', false);
    }
</script>

<template>
    <Dialog v-model:visible="props.visible" :style="{ width: '50vw' }" header="Create Role Access" :modal="true">
        <div class="flex flex-col gap-4">
            <label for="role_name">Role Name</label>
            <InputText id="role_name" v-model="newRole.role_name" />

            <label for="permissions">Permissions</label>
            <MultiSelect id="permissions" v-model="newRole.permissions" :options="props.permissions"
                option-label="permision_name" option-value="id" placeholder="Select permissions" />
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="closeDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveRole" />
        </template>
    </Dialog>
</template>
