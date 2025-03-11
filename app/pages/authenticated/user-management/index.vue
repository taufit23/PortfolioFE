<script setup>
    // user-management/index.vue

    // === PAGE META & IMPORTS ===
    // Konfigurasi layout dan middleware
    definePageMeta({
        layout: 'authenticated',
        middleware: 'auth'
    });
    const {
        $showToast
    } = useNuxtApp();

    // Import library yang dibutuhkan
    import {
        FilterMatchMode
    } from '@primevue/core/api';
    import {
        useToast
    } from 'primevue/usetoast';

    // === KONFIGURASI & STATE ===
    const config = useRuntimeConfig(); // Ambil konfigurasi runtime dari nuxt.config.js
    const baseURL = config.public.API_BASE_URL;
    const token = useCookie('token'); // Ambil token dari cookie
    const toast = useToast(); // Untuk notifikasi toast

    // State untuk manajemen user
    const users = ref([]);
    const selectedUsers = ref();
    const isLoading = ref(true);
    const buttonLoading = ref(false);
    const createUserDialog = ref(false);
    const newUser = ref({
        username: "",
        email: "",
        name: "",
        password: "",
        password_confirmation: "",
        use_default_password: false,
        use_default_roles: false,
        roles: [], // Akan diisi dengan id dari userRoles
        use_custom_permissions: false,
        permissions: [] // Akan diisi dengan id dari userPermissions
    });
    const editUserDialog = ref(false); // Dialog edit user
    const userDetailDialog = ref(false); // Dialog detail user
    const selectedUser = ref(null); // Data user yang dipilih
    // === create new user ===
    async function saveNewUser() {
        buttonLoading.value = true;
        try {
            const response = await $fetch(`${baseURL}user-management/createUser`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token.value.trim()}`,
                    "Content-Type": "application/json",
                },
                body: newUser.value, // $fetch otomatis konversi ke JSON
            });

            if (response) {
                // Tambahkan user yang baru dibuat ke dalam daftar users
                users.value.push(response.data);
                console.log(response.data);
                $showToast("success", "Success", "User successfully created!");

                createUserDialog.value = false; // Tutup dialog setelah sukses
                resetNewUser(); // Reset form setelah berhasil
            }
        } catch (err) {
            err.data.message
            const errorMessage = err.data ? err.data.message || Object.values(err.data.errors || {}).flat().join(
                "\n") : "-";

            $showToast("error", "Error", errorMessage);
        } finally {
            buttonLoading.value = false;
        }
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
            ...user
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
                    "Authorization": `Bearer ${token.value.trim()}`,
                    "Content-Type": "application/json",
                },
                body: editedUser.value,
            });

            const index = users.value.findIndex(u => u.id === editedUser.value.id);
            if (index !== -1) users.value[index] = {
                ...editedUser.value
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

    // === FETCH DATA USERS ===
    async function fetchUser() {
        isLoading.value = true; // Set loading ke true sebelum fetch
        try {
            const data = await $fetch(`${baseURL}user-management`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.value.trim()}`,
                    Accept: "application/json",
                },
            });

            users.value = data?.data || []; // Simpan hasil ke users
            $showToast("success", "Success", data?.statusMessage);

        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        } finally {
            isLoading.value = false; // Set loading ke false setelah fetch selesai
        }
    }



    // === DIALOG & FORM HANDLER ===
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

            // Jika request berhasil
            $showToast("success", "Success", data.statusMessage);


            selectedUser.value = data?.data || null;
            userDetailDialog.value = true;
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        }
    }


    // === TABLE & FILTERS ===
    const dt = ref();
    const userDialog = ref(false);
    const deleteuserDialog = ref(false);
    const filters = ref({
        global: {
            value: null,
            matchMode: FilterMatchMode.CONTAINS
        }
    });

    const statuses = ref([{
            label: 'INSTOCK',
            value: 'instock'
        },
        {
            label: 'LOWSTOCK',
            value: 'lowstock'
        },
        {
            label: 'OUTOFSTOCK',
            value: 'outofstock'
        }
    ]);

    // === UTILITIES ===
    function formatCurrency(value) {
        return value ? value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        }) : null;
    }



    function hideDialog() {
        userDialog.value = false;
    }

    function exportCSV() {
        dt.value.exportCSV();
    }



    // === get additional data ===
    const userRoles = ref([]);
    const userPermissions = ref([]);
    // Fungsi untuk mengambil data roles dari API
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
                <DataTable ref="dt" v-model:selection="selectedUsers" :value="users" dataKey="id"
                    :paginator="true" :rows="10" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users">
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

        <Dialog v-model:visible="editUserDialog" :style="{ width: '50vw' }" header="Edit User" :modal="true">
            <div class="flex flex-col gap-4">
                <label for="edit-username">Username</label>
                <InputText id="edit-username" v-model="editedUser.username" disabled />

                <label for="edit-name">Name</label>
                <InputText id="edit-name" v-model="editedUser.name" />

                <label for="edit-email">Email</label>
                <InputText id="edit-email" v-model="editedUser.email" />

                <label for="edit-roles">Roles</label>
                <MultiSelect id="edit-roles" v-model="editedUser.roles" :options="userRoles" optionLabel="role_name"
                    optionValue="id" placeholder="Select roles" />

                <label for="edit-permissions">Permissions</label>
                <MultiSelect id="edit-permissions" v-model="editedUser.permissions" :options="userPermissions"
                    optionLabel="permision_name" optionValue="id" placeholder="Select permissions" />
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="editUserDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="saveEditedUser" :loading="buttonLoading" />
            </template>
        </Dialog>

        <Dialog v-model:visible="userDetailDialog" :style="{ width: '450px' }" header="User Detail"
            :modal="true">
            <div v-if="selectedUser">
                <p><strong>Username:</strong> {{ selectedUser . username }}</p>
                <p><strong>Name:</strong> {{ selectedUser . name }}</p>
                <p><strong>Email:</strong> {{ selectedUser . email }}</p>
                <p><strong>Last Login:</strong> {{ selectedUser . last_login }}</p>
                <p><strong>Status:</strong> {{ selectedUser . status ? 'Active' : 'Inactive' }}</p>
            </div>
            <template #footer>
                <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUser(selectedUser)" />
                <Button icon="pi pi-trash" outlined rounded class="mr-2" severity="danger"
                    @click="confirmDeleteUser(selectedUser)" />
                <Button label="Close" icon="pi pi-times" text @click="userDetailDialog = false" />
            </template>
        </Dialog>

        <Dialog v-model:visible="createUserDialog" :style="{ width: '50vw' }" header="Create User"
            :modal="true">
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
                <InputText id="password" type="password" v-model="newUser.password"
                    :disabled="newUser.use_default_password" />

                <!-- Password Confirmation -->
                <label for="password_confirmation">Confirm Password</label>
                <InputText id="password_confirmation" type="password" v-model="newUser.password_confirmation"
                    :disabled="newUser.use_default_password" />

                <!-- Use Default Password -->
                <div class="flex items-center gap-2">
                    <Checkbox id="use_default_password" v-model="newUser.use_default_password"
                        :binary="true" />
                    <label for="use_default_password">Use Default Password</label>
                </div>


                <!-- Use Default Roles -->
                <div class="flex items-center gap-2">
                    <Checkbox id="use_default_roles" v-model="newUser.use_default_roles" :binary="true" />
                    <label for="use_default_roles">Use Default Roles</label>
                </div>

                <!-- Roles Selection -->
                <label for="roles">Roles</label>
                <MultiSelect id="roles" v-model="newUser.roles" :options="userRoles" optionLabel="role_name"
                    optionValue="id" placeholder="Select roles" :disabled="newUser.use_default_roles" />

                <!-- Use Custom Permissions -->
                <div class="flex items-center gap-2">
                    <Checkbox id="use_custom_permissions" v-model="newUser.use_custom_permissions"
                        :binary="true" />
                    <label for="use_custom_permissions">Use Custom Permissions</label>
                </div>

                <!-- Permissions Selection -->
                <label for="permissions">Permissions</label>
                <MultiSelect id="permissions" v-model="newUser.permissions" :options="userPermissions"
                    optionLabel="permision_name" optionValue="id" placeholder="Select permissions"
                    :disabled="!newUser.use_custom_permissions" />

            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="createUserDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="saveNewUser" :loading="buttonLoading" />
            </template>
        </Dialog>

    </div>

</template>
