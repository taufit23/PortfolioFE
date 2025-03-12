<script setup>
    // === PAGE META & IMPORTS ===
    import {
        FilterMatchMode
    } from '@primevue/core/api'
    import {
        useUserManagement
    } from '~/composables/useUserManagement'

    definePageMeta({
        layout: 'authenticated',
        middleware: 'auth',
    })

    const {
        fetchUser,
        fetchUserRoles,
        fetchUserPermissions,
        saveNewUser,
        saveEditedUser,
        showDetailUser
    } = useUserManagement()


    // === STATE MANAGEMENT ===
    const users = ref([])
    const selectedUsers = ref()
    const confirmDeleteUser = ref(false)
    const isLoading = ref(true)
    const buttonLoading = ref(false)
    const createUserDialog = ref(false)
    const newUser = ref({
        username: '',
        email: '',
        name: '',
        password: '',
        password_confirmation: '',
        use_default_password: false,
        use_default_roles: false,
  roles: [],
        use_custom_permissions: false,
        permissions: [],
    })
    const editUserDialog = ref(false)
    const userDetailDialog = ref(false)
    const selectedUser = ref(null)
    const editedUser = ref({})

    // === HANDLERS ===
    function openCreateUserDialog() {
        createUserDialog.value = true
    }

    async function handleSaveNewUser() {
        buttonLoading.value = true
        await saveNewUser(newUser.value, users, () => {
            createUserDialog.value = false
            resetNewUser()
        }, resetNewUser)
        buttonLoading.value = false
    }

    async function handleSaveEditedUser() {
        buttonLoading.value = true
        await saveEditedUser(editedUser.value, users, () => {
            editUserDialog.value = false
        })
        buttonLoading.value = false
    }

    async function handleShowDetailUser(user) {
        selectedUser.value = await showDetailUser(user)
        if (selectedUser.value) {
            userDetailDialog.value = true
        }
    }

    function resetNewUser() {
        newUser.value = {
            username: '',
            email: '',
            name: '',
            password: '',
            password_confirmation: '',
            use_default_password: false,
            use_default_roles: false,
            roles: [],
            use_custom_permissions: false,
            permissions: [],
        }
    }

    function editUser(user) {
        editedUser.value = {
            ...user
        }
        editUserDialog.value = true
    }

    // === TABLE & FILTER CONFIG ===
    const dt = ref()
    const filters = ref({
        global: {
            value: null,
            matchMode: FilterMatchMode.CONTAINS,
        },
    })

    // === GET ADDITIONAL DATA ===
    const userRoles = ref([])
    const userPermissions = ref([])

    // === FETCH DATA ON MOUNT ===
    onMounted(async () => {
        isLoading.value = true
        users.value = await fetchUser()
        userRoles.value = await fetchUserRoles()
        userPermissions.value = await fetchUserPermissions()
        isLoading.value = false
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
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="dt.exportCSV()" />
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
                                @click="handleShowDetailUser(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded class="mr-2" severity="danger"
                                @click="confirmDeleteUser(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <UserCreateDialog :visible="createUserDialog" :roles="userRoles" :permissions="userPermissions"
            @update:visible="createUserDialog = $event" @save-user="handleSaveNewUser" />
        <UserDetailDialog :visible="userDetailDialog" :user="selectedUser"
            @update:visible="userDetailDialog = $event" @edit-user="editUser" @delete-user="confirmDeleteUser" />

        <Dialog v-model:visible="createUserDialog" :style="{ width: '50vw' }" header="Create User"
            :modal="true">
            <div class="flex flex-col gap-4">
                <label for="username">Username</label>
                <InputText id="username" v-model="newUser.username" />

                <label for="name">Name</label>
                <InputText id="name" v-model="newUser.name" />

                <label for="email">Email</label>
                <InputText id="email" v-model="newUser.email" />

                <label for="password">Password</label>
                <InputText id="password" v-model="newUser.password" type="password"
                    :disabled="newUser.use_default_password" />

                <label for="password_confirmation">Confirm Password</label>
                <InputText id="password_confirmation" v-model="newUser.password_confirmation" type="password"
                    :disabled="newUser.use_default_password" />

                <label for="roles">Roles</label>
                <MultiSelect id="roles" v-model="newUser.roles" :options="userRoles" option-label="role_name"
                    option-value="id" placeholder="Select roles" :disabled="newUser.use_default_roles" />
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="createUserDialog = false" />
                <Button label="Save" icon="pi pi-check" :loading="buttonLoading" @click="handleSaveNewUser" />
            </template>
        </Dialog>
    </div>
</template>
