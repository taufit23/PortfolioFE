<script setup>
    //user-management/index.vue
    definePageMeta({
        layout: 'authenticated',
        middleware: 'auth'
    });
    import {
        FilterMatchMode
    } from '@primevue/core/api';
    import {
        useToast
    } from 'primevue/usetoast';

    // Ambil konfigurasi runtime dari nuxt.config.js
    const config = useRuntimeConfig();
    const baseURL = config.public.API_BASE_URL;

    // Ambil token dari cookie
    const token = useCookie('token');
    // State buat nyimpen data users
    const users = ref([]);
    const isLoading = ref(true);
    onMounted(async () => {
        const {
            data,
            error
        } = await useFetch(`${baseURL}user-management`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.value.trim()}`
            }
        });

        if (!error.value) {
            users.value = data.value?.data;
        }

        isLoading.value = false;
    });

    const toast = useToast();
    const dt = ref();
    const products = ref();
    const userDialog = ref(false);
    const deleteuserDialog = ref(false);
    const deleteProductsDialog = ref(false);
    const product = ref({});
    const selectedProducts = ref();
    const filters = ref({
        global: {
            value: null,
            matchMode: FilterMatchMode.CONTAINS
        }
    });
    const submitted = ref(false);
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

    function formatCurrency(value) {
        if (value) return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
        return;
    }

    function openNew() {
        product.value = {};
        submitted.value = false;
        userDialog.value = true;
    }

    function hideDialog() {
        userDialog.value = false;
        submitted.value = false;
    }

    function saveProduct() {
        submitted.value = true;

        if (product?.value.name?.trim()) {
            if (product.value.id) {
                product.value.inventoryStatus = product.value.inventoryStatus.value ? product.value.inventoryStatus
                    .value : product.value.inventoryStatus;
                products.value[findIndexById(product.value.id)] = product.value;
                toast.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Updated',
                    life: 3000
                });
            } else {
                product.value.id = createId();
                product.value.code = createId();
                product.value.image = 'product-placeholder.svg';
                product.value.inventoryStatus = product.value.inventoryStatus ? product.value.inventoryStatus.value :
                    'INSTOCK';
                products.value.push(product.value);
                toast.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Created',
                    life: 3000
                });
            }

            userDialog.value = false;
            product.value = {};
        }
    }

    function editUser(prod) {
        product.value = {
            ...prod
        };
        userDialog.value = true;
    }

    function confirmDeleteUser(prod) {
        product.value = prod;
        deleteuserDialog.value = true;
    }
    const userDetailDialog = ref(false); // State untuk pop-up
    const selectedUser = ref(null); // State untuk menyimpan data user

    async function showDetailUser(user) { // Pastikan nama fungsi sesuai
        try {
            const {
                data,
                error
            } = await useFetch(`${baseURL}user-management/showUser`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.value.trim()}`
                },
                body: JSON.stringify({
                    user_id: user.id
                }) // Kirim payload dengan user_id
            });

            if (!error.value) {
                selectedUser.value = data.value.data; // Simpan data user ke state
                userDetailDialog.value = true; // Tampilkan pop-up
            } else {
                toast.add({
                    severity: "error",
                    summary: "Error",
                    detail: "Gagal mengambil data user",
                    life: 3000
                });
            }
        } catch (err) {
            console.error("Error fetching user detail:", err);
            toast.add({
                severity: "error",
                summary: "Error",
                detail: "Terjadi kesalahan",
                life: 3000
            });
        }
    }

    function deleteProduct() {
        products.value = products.value.filter((val) => val.id !== product.value.id);
        deleteuserDialog.value = false;
        product.value = {};
        toast.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Product Deleted',
            life: 3000
        });
    }

    function findIndexById(id) {
        let index = -1;
        for (let i = 0; i < products.value.length; i++) {
            if (products.value[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    function createId() {
        let id = '';
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    function exportCSV() {
        dt.value.exportCSV();
    }

    function confirmDeleteSelected() {
        deleteProductsDialog.value = true;
    }

    function deleteSelectedProducts() {
        products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
        deleteProductsDialog.value = false;
        selectedProducts.value = null;
        toast.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Products Deleted',
            life: 3000
        });
    }

    function getStatusLabel(status) {
        switch (status) {
            case 'INSTOCK':
                return 'success';

            case 'LOWSTOCK':
                return 'warn';

            case 'OUTOFSTOCK':
                return 'danger';

            default:
                return null;
        }
    }
</script>
<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
                        :disabled="!selectedProducts || !selectedProducts.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable ref="dt" v-model:selection="selectedProducts" :value="users" dataKey="id"
                :paginator="true" :rows="10" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
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

                <!-- <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column> -->
                <Column field="username" header="Username" sortable style="min-width: 12rem" />
                <Column field="name" header="Name" sortable style="min-width: 16rem" />
                <Column field="email" header="Email" sortable style="min-width: 16rem" />
                <Column header="Action" :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUser(slotProps.data)" />
                        <Button icon="pi pi-eye" outlined rounded class="mr-2" severity="info"
                            @click="showDetailUser(slotProps.data)" />

                        <Button icon="pi pi-trash" outlined rounded class="mr-2" severity="danger"
                            @click="confirmDeleteUser(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

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
                <Button label="Close" icon="pi pi-times" text @click="userDetailDialog = false" />
            </template>
        </Dialog>


        <Dialog v-model:visible="deleteuserDialog" :style="{ width: '450px' }" header="Confirm"
            :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Are you sure you want to delete <b>{{ product . name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteuserDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteProduct" />
            </template>
        </Dialog>
        <Dialog v-model:visible="userDetailDialog" :style="{ width: '450px' }" header="User Details"
            :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-user !text-3xl" />
                <span v-if="selectedUser">
                    <b>{{ selectedUser . name }}</b> ({{ selectedUser . username }})
                </span>
            </div>
            <div class="mt-4">
                <p><strong>Email:</strong> {{ selectedUser . email }}</p>
                <p><strong>Status:</strong> {{ selectedUser . status ? 'Active' : 'Inactive' }}</p>
                <p><strong>Login Status:</strong> {{ selectedUser . login_status ? 'Online' : 'Offline' }}</p>
                <p><strong>Last Login:</strong> {{ selectedUser . last_login }}</p>
                <p><strong>Roles:</strong></p>
                <ul class="list-disc pl-6">
                    <li v-for="role in selectedUser.roles" :key="role.role_name">
                        <strong>{{ role . role_name }}</strong>
                        <ul class="list-circle pl-4">
                            <li v-for="perm in role.permision" :key="perm.permision_slug">
                                {{ perm . permision_name }}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <template #footer>
                <Button label="Close" icon="pi pi-times" @click="userDetailDialog = false"
                    class="p-button-secondary" />
            </template>
        </Dialog>
        <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm"
            :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Are you sure you want to delete the selected products?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
            </template>
        </Dialog>
    </div>

</template>
