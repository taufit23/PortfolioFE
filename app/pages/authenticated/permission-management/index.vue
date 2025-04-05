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
    const selectedPermision = ref();
    const deleteConfirmDialog = ref();
    const selectedPermissionToDelete = ref({});
    const {
        $showToast
    } = useNuxtApp();

    const config = useRuntimeConfig();
    const baseURL = config.public.API_BASE_URL;
    const token = useCookie("token");
    const {
        loadingMap: loadingDetailMap,
        setLoading: setDetailLoading
    } = useItemLoading()
    const {
        loadingMap: loadingDeleteMap,
        setLoading: setDeleteLoading
    } = useItemLoading()


    const isLoading = ref(true);
    const buttonLoading = ref(false);

    const dt = ref();
    const filters = ref({
        global: {
            value: null,
            matchMode: FilterMatchMode.CONTAINS,
        },
    });

    const permissionLists = ref([]);
    const craetePermisionDialog = ref(false);
    const updatePermisionDialog = ref(false);
    const permissionData = ref({});
    const fecthHeader = {
        Authorization: `Bearer ${token.value.trim()}`,
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    const permissionDetailDialog = ref(false);
    const permissionDeleteDialog = ref(false);
    // NOTE: Define Functions
    function openCreatePermision() {
        craetePermisionDialog.value = true;
    }

    function exportCSV() {
        dt.value.exportCSV();
    }

    function resetnewPermission() {
        newPermission.value = {
            permision_name: "",
            permision_desc: "",
            permissions: [],
        };
    }

    // get data permisions
    async function fetchpermissionLists() {
        try {
            const data = await $fetch(`${baseURL}manage-permissions`, {
                method: "POST",
                headers: fecthHeader,
            });

            // Set data jika berhasil
            permissionLists.value = data?.data || [];
            $showToast("success", "Success", data.statusMessage);
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        } finally {
            isLoading.value = false;
        }
    }

    function truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + "..." : text;
    }

    async function saveNewPermission(permissionData) {
        buttonLoading.value = true;
        try {
            const response = await $fetch(`${baseURL}manage-permissions/store`, {
                method: "POST",
                headers: fecthHeader,
                body: permissionData, // Gunakan data dari child component
            });

            if (response) {
                permissionLists.value.push(response.data);
                $showToast("success", "Success", response.data?.statusMessage);

                craetePermisionDialog.value = false;
            }
        } catch (err) {
            console.log(err);
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


    // Fungsi untuk membuka modal edit dan mengisi data
    function editPermission(permission) {
        permissionData.value = {
            ...permission
        };
        updatePermisionDialog.value = true;
    }

    // Perbaiki fungsi updatePermission agar menggunakan PUT
    async function updatePermission(permissionData) {
        try {
            const response = await $fetch(
                `${baseURL}manage-permissions/update`, {
                    method: "PUT",
                    headers: fecthHeader,
                    body: permissionData,
                });

            if (response) {
                const index = permissionLists.value.findIndex(p => p.id === response?.data?.id);
                if (index !== -1) {
                    permissionLists.value[index] = response.data;
                }

                $showToast("success", "Success", response?.statusMessage);
                updatePermisionDialog.value = false; // ✅ Tutup modal setelah update sukses
            }
        } catch (err) {
            console.log(err);
            const errorMessage = err.data ?
                err.data.message || Object.values(err.data.errors || {}).flat().join("\n") :
                "-";

            $showToast("error", "Error", errorMessage);
        }
    }

    async function showDetailPermision(permission) {
        setDetailLoading(permission.id, true)
        try {
            const data = await $fetch(`${baseURL}manage-permissions/show`, {
                method: "POST",
                headers: fecthHeader,
                body: JSON.stringify({
                    permision_id: permission.id
                }),
            });

            if (data?.data) {
                permissionData.value = data.data;
            }

            $showToast("success", "Success", data.statusMessage);
            permissionDetailDialog.value = true;
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        } finally {
            setDetailLoading(permission.id, false)
        }
    }

    async function confirmDeletePermission(permission) {
        setDeleteLoading(permission.id, true)

        try {
            const data = await $fetch(`${baseURL}manage-permissions/show`, {
                method: "POST",
                headers: fecthHeader,
                body: JSON.stringify({
                    permision_id: permission.id,
                    is_deletable: true
                }),
            });

            if (data?.data) {
                const permissionData = data.data;
                selectedPermissionToDelete.value = permissionData;
                deleteConfirmDialog.value = true;
            }
            emit("update:visible", true);
            $showToast("success", "Success", data.statusMessage);
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        } finally {
            setDeleteLoading(permission.id, false)
        }
    }

    async function deletePermission(permission) {
        buttonLoading.value = true;
        try {
            const data = await $fetch(`${baseURL}manage-permissions/delete`, {
                method: "DELETE",
                headers: fecthHeader,
                body: {
                    permision_id: permission.id
                },
            });

            permissionLists.value = permissionLists.value.filter(p => p.id !== permission.id);
            $showToast("success", "Deleted", data.statusMessage);
            deleteConfirmDialog.value = false;
        } catch (err) {
            const errorMessage = err?.response?._data?.message;
            $showToast("error", "Error", errorMessage);
        } finally {
            buttonLoading.value = false;
        }
    }
    onMounted(async () => {
        fetchpermissionLists();
    });
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2"
                        @click="openCreatePermision" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>
            <CommonLoadingSkeleton v-if="isLoading" />

            <div v-else>
                <DataTable ref="dt" v-model:selection="selectedPermision" :value="permissionLists" data-key="id"
                    :paginator="true" :rows="10" :filters="filters"
                    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rows-per-page-options="[5, 10, 25]"
                    current-page-report-template="Showing {first} to {last} of {totalRecords} permissionLists">
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Manage App Permisions</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column field="permision_name" header="Permission Name" sortable style="min-width: 12rem" />
                    <Column field="permision_desc" header="Permission Desc" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            {{ truncateText(slotProps . data . permision_desc, 50) }}
                        </template>
                    </Column>
                    <Column field="is_menu" header="Is Menu" sortable style="min-width: 5rem" />

                    <Column header="Action" :exportable="false" style="min-width: 12rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2"
                                @click="editPermission(slotProps.data)" />

                            <Button icon="pi pi-eye" outlined rounded class="mr-2" severity="info"
                                @click="showDetailPermision(slotProps.data)"
                                :loading="loadingDetailMap[slotProps.data.id] || false"
                                :disabled="loadingDetailMap[slotProps.data.id] || false" />

                            <Button icon="pi pi-trash" outlined rounded class="mr-2" severity="danger"
                                @click="confirmDeletePermission(slotProps.data)"
                                :loading="loadingDeleteMap[slotProps.data.id] || false"
                                :disabled="loadingDeleteMap[slotProps.data.id] || false" />

                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <PermissionCreatePermissionDialog :visible="craetePermisionDialog" :permissions="permissionLists"
            :buttonLoading="buttonLoading" @update:visible="craetePermisionDialog = $event"
            @save-permission="saveNewPermission" />

        <PermissionEditPermissionDialog :visible="updatePermisionDialog" :permission="permissionData"
            @update:visible="updatePermisionDialog = $event" @update-permission="updatePermission" />

        <PermissionDetailPermissionDialog :visible="permissionDetailDialog" :permission="permissionData"
            @update:visible="permissionDetailDialog = $event" />
        <PermissionDeletePermissionDialog :visible="deleteConfirmDialog" :permission="selectedPermissionToDelete"
            :buttonLoading="buttonLoading" @update:visible="deleteConfirmDialog = $event"
            @delete-permission="deletePermission" />


    </div>
</template>
