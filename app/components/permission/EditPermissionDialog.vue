<script setup>
    // app\components\permission\EditPermissionDialog.vue
    import {
        defineProps,
        defineEmits,
        ref,
        watch
    } from 'vue';

    const props = defineProps({
        visible: Boolean,
        permission: Object,
        buttonLoading: Boolean,

    });

    // Emit untuk komunikasi dengan parent
    const emit = defineEmits(['update:visible', 'update-permission']);

    const dataPermission = ref({
        permision_id: '',
        permision_name: '',
        permision_desc: '',
        is_menu: '',
    });

    //  Update `dataPermission` setiap kali `props.permission` berubah
    watch(() => props.permission, (newVal) => {
        if (newVal) {
            dataPermission.value = {
                permision_id: newVal.id,
                permision_name: newVal.permision_name,
                permision_desc: newVal.permision_desc,
                is_menu: newVal.is_menu,
            };
        }
    }, {
        immediate: true
    });



    function updatePermission() {
        emit('update-permission', dataPermission.value); //  Kirim data yang sudah diubah
    }

    function closeDialog() {
        emit('update:visible', false);
    }
</script>

<template>
    <Dialog v-model:visible="props.visible" :style="{ width: '50vw' }" header="Edit Permission" :modal="true">
        <div class="flex flex-col gap-4">
            <label for="permision_name">Permission Name</label>
            <InputText id="permision_name" v-model="dataPermission.permision_name" />

            <label for="permision_desc" class="block font-bold mb-3">Permision Desc</label>
            <Textarea id="permision_desc" v-model="dataPermission.permision_desc" required="true" rows="3"
                cols="20" fluid />

            <!-- Radio Button untuk "is_menu" -->
            <div class="flex gap-4 items-center">
                <label class="font-bold">Is Menu? :</label>
                <div class="flex gap-2 items-center">
                    <RadioButton id="is_menu_yes" v-model="dataPermission.is_menu" name="is_menu" value="yes" />
                    <label for="is_menu_yes">Yes</label>
                </div>
                <div class="flex gap-2 items-center">
                    <RadioButton id="is_menu_no" v-model="dataPermission.is_menu" name="is_menu" value="no" />
                    <label for="is_menu_no">No</label>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="closeDialog" />
            <Button label="Save" icon="pi pi-check" :loading="props.buttonLoading" :disabled="props.buttonLoading"
                @click="updatePermission" />
        </template>
    </Dialog>
</template>
