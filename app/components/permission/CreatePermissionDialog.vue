<script setup>
    // app\components\permission\CreatePermissionDialog.vue
    import {
        defineProps,
        defineEmits,
        ref
    } from 'vue';

    const props = defineProps({
        visible: Boolean,
    });

    // Emit untuk komunikasi dengan parent
    const emit = defineEmits(['update:visible', 'save-permission']);

    const newPermission = ref({
        permision_name: '',
        permision_desc: '',
        is_menu: '',
    });

    function savePermission() {
        emit('save-permission', newPermission.value);
    }

    // Function untuk menutup dialog
    function closeDialog() {
        emit('update:visible', false);
    }
</script>

<template>
    <Dialog v-model:visible="props.visible" :style="{ width: '50vw' }" header="Create Permission" :modal="true">
        <div class="flex flex-col gap-4">
            <label for="permision_name">Permission Name</label>
            <InputText id="permision_name" v-model="newPermission.permision_name" />

            <label for="permision_desc" class="block font-bold mb-3">Permision Desc</label>
            <Textarea id="permision_desc" v-model="newPermission.permision_desc" required="true" rows="3"
                cols="20" fluid />

            <!-- Radio Button untuk "is_menu" -->
            <div class="flex gap-4 items-center">
                <label class="font-bold">Is Menu? :</label>
                <div class="flex gap-2 items-center">
                    <RadioButton id="is_menu_yes" v-model="newPermission.is_menu" name="is_menu" value="yes" />
                    <label for="is_menu_yes">Yes</label>
                </div>
                <div class="flex gap-2 items-center">
                    <RadioButton id="is_menu_no" v-model="newPermission.is_menu" name="is_menu" value="no" />
                    <label for="is_menu_no">No</label>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="closeDialog" />
            <Button label="Save" icon="pi pi-check" @click="savePermission" />
        </template>
    </Dialog>
</template>
