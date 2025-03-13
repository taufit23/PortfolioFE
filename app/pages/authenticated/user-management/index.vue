<script setup>
    // pages/authenticated/user-management/index.vue

    import {
        FilterMatchMode
    } from "@primevue/core/api";

    const {
        $showToast
    } = useNuxtApp();

    const config = useRuntimeConfig();
    const baseURL = config.public.API_BASE_URL;
    const token = useCookie("token");

    const users = ref([]);
    const selectedUsers = ref();
    const isLoading = ref(true);
    const buttonLoading = ref(false);
    const createUserDialog = ref(false);

    const editUserDialog = ref(false);
    const userDetailDialog = ref(false);
    const selectedUser = ref(null);

    async function saveNewUser() {
        buttonLoading.value = true;
        try {
            const response = await $fetch(`${baseURL}user-management/createUser`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.value.trim()}`,
                    "Content-Type": "application/json",
                },
                body: newUser.value,
            });

            if (response) {
                users.value.push(response.data);
                console.log(response.data);
                $showToast("success", "Success", "User successfully created!");

                createUserDialog.value = false;
                resetNewUser();
            }
        } catch (err) {
            err.data.message;
            const errorMessage = err.data ?
                err.data.message ||
                Object.values(err.data.errors || {})
                .flat()
                .join("\n") :
                "-";

            $showToast("error", "Error", errorMessage);
        } finally {
            buttonLoading.value = false;
        }
    }

    function confirmDeleteUser() {
        console.log("deleteConfirmationDialog");
    }

    function resetNewUser() {
        newUser.value = {
            username: "",
            email: "",
            name: "",
            password: "",
            password_confirmation: "",
            use_default_password: false,
            use_default_roles: false,
            roles: [],
            use_custom_permissions: false,
            permissions: [],
        };
    }

    function editUser(user) {
        editedUser.value = {
            ...user,
            roles: user.roles.map((role) => role.id), // Convert roles ke array of ID
            custom_permisions: user.custom_permisions.map((perm) => perm.id), // Convert permissions ke array of ID
        };

        editUserDialog.value = true;
    }

    const editedUser = ref({});

    async function saveEditedUser() {
        buttonLoading.value = true;
        try {
            await $fetch(`${baseURL}user-management/updateUser`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token.value.trim()}`,
                    "Content-Type": "application/json",
                },
                body: editedUser.value,
            });

            const index = users.value.findIndex((u) => u.id === editedUser.value.id);
            if (index !== -1)
                users.value[index] = {
                    ...editedUser.value,
                };

            $showToast("success", "Success", "Success Edit");

            editUserDialog.value = false;
        } catch (err) {
            console.error("Error updating user:", err);
            $showToast("error", "Error", err.message);
        } finally {
            buttonLoading.value = false;
        }
    }

    async function fetchUser() {
        isLoading.value = true;
        try {
            const data = await $fetch(`${baseURL}user-management`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.value.trim()}`,
                    Accept: "application/json",
                },
            });

            users.value = data?.data || [];
            $showToast("success", "Success", data?.statusMessage);
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        } finally {
            isLoading.value = false;
        }
    }

    function openCreateUserDialog() {
        createUserDialog.value = true;
    }

    async function showDetailUser(user) {
        try {
            const data = await $fetch(`${baseURL}user-management/showUser`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.value.trim()}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: user.id,
                }),
            });

            $showToast("success", "Success", data.statusMessage);

            selectedUser.value = data?.data || null;
            userDetailDialog.value = true;
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        }
    }

    const dt = ref();
    const userDialog = ref(false);
    const deleteuserDialog = ref(false);
    const filters = ref({
        global: {
            value: null,
            matchMode: FilterMatchMode.CONTAINS,
        },
    });

    function hideDialog() {
        userDialog.value = false;
    }

    function exportCSV() {
        dt.value.exportCSV();
    }

    // === get additional data ===
    const userRoles = ref([]);
    const userPermissions = ref([]);

    async function fetchUserRoles() {
        try {
            const data = await $fetch(`${baseURL}manage-roles`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.value.trim()}`,
                    Accept: "application/json",
                },
            });

            // Simpan hasil ke userRoles
            userRoles.value = data?.data || [];
            $showToast("success", "Success", data.statusMessage);
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        }
    }

    // get data permisions
    async function fetchUserPermissions() {
        try {
            const data = await $fetch(`${baseURL}manage-permissions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.value.trim()}`,
                    Accept: "application/json",
                },
            });

            // Set data jika berhasil
            userPermissions.value = data?.data || [];
            $showToast("success", "Success", data.statusMessage);
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        }
    }
    // === on app load ===
    onMounted(async () => {
        fetchUser();
        fetchUserRoles();
        fetchUserPermissions();
    });
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2"
                        @click="openCreateUserDialog" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>
            <CommonLoadingSkeleton v-if="isLoading" />

            <div v-else>
                <DataTable ref="dt" v-model:selection="selectedUsers" :value="users" data-key="id"
                    :paginator="true" :rows="10" :filters="filters"
                    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rows-per-page-options="[5, 10, 25]"
                    current-page-report-template="Showing {first} to {last} of {totalRecords} users">
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Manage Users</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column field="username" header="Username" sortable style="min-width: 12rem" />
                    <Column field="name" header="Name" sortable style="min-width: 16rem" />
                    <Column field="email" header="Email" sortable style="min-width: 16rem" />
                    <Column header="Action" :exportable="false" style="min-width: 12rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2"
                                @click="editUser(slotProps.data)" />

                            <Button icon="pi pi-eye" outlined rounded class="mr-2" severity="info"
                                @click="showDetailUser(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded class="mr-2" severity="danger"
                                @click="confirmDeleteUser(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <UserCreateDialog :visible="createUserDialog" :roles="userRoles" :permissions="userPermissions"
            @update:visible="createUserDialog = $event" @save-user="saveNewUser" />
        <UserDetailDialog :visible="userDetailDialog" :user="selectedUser"
            @update:visible="userDetailDialog = $event" @edit-user="editUser" @delete-user="confirmDeleteUser" />
        <UserEditUserDialog :visible="editUserDialog" :user="editedUser" :roles="userRoles"
            :permissions="userPermissions" @update:visible="editUserDialog = $event" @save-user="saveEditedUser" />
        <UserCreateDialog :visible="createUserDialog" :roles="userRoles" :permissions="userPermissions"
            @update:visible="createUserDialog = $event" @save-user="saveNewUser" />
    </div>
</template>
