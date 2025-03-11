<script setup>
    import {
        defineProps,
        defineEmits
    } from "vue";

    // Props untuk menerima data dari parent
    const props = defineProps({
        visible: Boolean, // Status dialog (open/close)
        user: Object, // Data user yang akan ditampilkan
    });

    // Emit untuk menutup dialog
    const emit = defineEmits(["update:visible", "edit-user", "delete-user"]);

    function closeDialog() {
        emit("update:visible", false);
    }

    function editUser() {
        emit("edit-user", props.user);
    }

    function deleteUser() {
        emit("delete-user", props.user);
    }
</script>

<template>
    <Dialog v-model:visible="props.visible" :style="{ width: '450px' }" header="User Detail" :modal="true">
        <div v-if="user">
            <p><strong>Username:</strong> {{ user . username }}</p>
            <p><strong>Name:</strong> {{ user . name }}</p>
            <p><strong>Email:</strong> {{ user . email }}</p>
            <p><strong>Last Login:</strong> {{ user . last_login }}</p>
            <p><strong>Status:</strong> {{ user . status ? 'Active' : 'Inactive' }}</p>
        </div>

        <template #footer>
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUser" />
            <Button icon="pi pi-trash" outlined rounded class="mr-2" severity="danger" @click="deleteUser" />
            <Button label="Close" icon="pi pi-times" text @click="closeDialog" />
        </template>
    </Dialog>
</template>
