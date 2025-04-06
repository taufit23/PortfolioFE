<script setup>
    // pages/authenticated/roles-management/index.vue

    import {
        FilterMatchMode
    } from "@primevue/core/api";
    definePageMeta({
        layout: "authenticated",
        middleware: "auth",
    });

    // NOTE: Define Variabel
    const {
        get,
        post,
        put,
        patch,
        del
    } = useApi();
    const selectedRoles = ref();
    const {
        $showToast
    } = useNuxtApp();
    const {
        loadingMap: loadingDetailMap,
        setLoading: setDetailLoading
    } = useItemLoading()
    const {
        loadingMap: loadingDeleteMap,
        setLoading: setDeleteLoading
    } = useItemLoading()

    const config = useRuntimeConfig();
    const baseURL = config.public.API_BASE_URL;
    const token = useCookie("token");

    const isLoading = ref(true);
    const buttonLoading = ref(false);

    const dt = ref();
    const filters = ref({
        global: {
            value: null,
            matchMode: FilterMatchMode.CONTAINS,
        },
    });

    const rolesLists = ref([]);
    const permisionLists = ref([]);
    const createRoleDialog = ref(false);

    // NOTE: Define Functions
    function openCreateRoles() {
        createRoleDialog.value = true;
    }

    function exportCSV() {
        dt.value.exportCSV();
    }

    function resetNewRole() {
        newRole.value = {
            role_name: "",
            role_desc: "",
            permissions: [],
        };
    }

    async function fetchrolesLists() {
        try {
            const data = await post('manage-roles');

            // Simpan hasil ke rolesLists
            rolesLists.value = data?.data || [];
            $showToast("success", "Success", data.statusMessage);
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        } finally {
            isLoading.value = false;
        }
    }

    // get data permisions
    async function fetchpermisionLists() {
        try {
            const data = await post('manage-permissions');
            // Set data jika berhasil
            permisionLists.value = data?.data || [];
            $showToast("success", "Success", data.statusMessage);
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        }
    }

    function truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + "..." : text;
    }

    async function saveNewRole() {
        buttonLoading.value = true;
        try {
            const response = await post('manage-roles/store', newRole.value);
            if (response) {
                rolesLists.value.push(response.data);
                console.log(response.data);
                $showToast("success", "Success", response.data?.statusMessage);

                createRoleDialog.value = false;
                resetNewRole();
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
    async function showDetailRole(role) {
        setDetailLoading(role.id, true)
        try {
            const data = await post('manage-roles/show', {
                role_id: role.id
            });
            // Tampilkan data ke dialog detail (belum ditampilkan di UI ya, tinggal lo tambahin kalau butuh)
            console.log("Detail:", data.data)
            $showToast("success", "Success", data.statusMessage)
        } catch (err) {
            const errorMessage = err?.response?._data?.message
            $showToast("error", "Error", errorMessage)
        } finally {
            setDetailLoading(role.id, false)
        }
    }

    async function confirmDeleteRole(role) {
        setDeleteLoading(role.id, true)
        try {
            const data = await post('manage-roles/show', {
                role_id: role.id,
                is_deletable: true
            });
            // Contoh konfirmasi log
            console.log("Can be deleted:", data.data)
            $showToast("success", "Success", data.statusMessage)
            // Tinggal munculin dialog konfirmasi delete kalau mau (lo bisa trigger modal dari sini)
        } catch (err) {
            const errorMessage = err?.response?._data?.message
            $showToast("error", "Error", errorMessage)
        } finally {
            setDeleteLoading(role.id, false)
        }
    }
    onMounted(async () => {
        fetchrolesLists();
        fetchpermisionLists();
    });
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openCreateRoles" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>
            <CommonLoadingSkeleton v-if="isLoading" />

            <div v-else>
                <DataTable ref="dt" v-model:selection="selectedRoles" :value="rolesLists" data-key="id"
                    :paginator="true" :rows="10" :filters="filters"
                    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rows-per-page-options="[5, 10, 25]"
                    current-page-report-template="Showing {first} to {last} of {totalRecords} rolesLists">
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Manage Role Access</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column field="role_name" header="Role Name" sortable style="min-width: 12rem" />
                    <Column field="role_desc" header="Role Desc" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            {{ truncateText(slotProps . data . role_desc, 50) }}
                        </template>
                    </Column>

                    <Column header="Action" :exportable="false" style="min-width: 12rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2"
                                @click="editRole(slotProps.data)" />

                            <Button icon="pi pi-eye" outlined rounded class="mr-2" severity="info"
                                @click="showDetailRole(slotProps.data)"
                                :loading="loadingDetailMap[slotProps.data.id] || false"
                                :disabled="loadingDetailMap[slotProps.data.id] || false" />

                            <Button icon="pi pi-trash" outlined rounded class="mr-2" severity="danger"
                                @click="confirmDeleteRole(slotProps.data)"
                                :loading="loadingDeleteMap[slotProps.data.id] || false"
                                :disabled="loadingDeleteMap[slotProps.data.id] || false" />

                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <RolesCreateRoleDialog :visible="createRoleDialog" :permissions="permisionLists"
            @update:visible="createRoleDialog = $event" @save-role="saveNewRole" />
    </div>
</template>
