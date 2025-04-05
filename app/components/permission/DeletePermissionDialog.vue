<script setup>
    import {
        defineProps,
        defineEmits
    } from 'vue'

    const props = defineProps({
        visible: Boolean,
        permission: Object,
        buttonLoading: Boolean,

    })

    const emit = defineEmits(['update:visible', 'delete-permission'])

    function closeDialog() {
        emit('update:visible', false)
    }
</script>

<template>
    <Dialog v-model:visible="props.visible" :style="{ width: '50vw' }" header="Delete Permission" :modal="true">
        <div class="p-4 border border-round surface-100">
            <div class="mb-3">
                <p class="font-bold text-lg mb-2">{{ permission . permision_name }}</p>
                <p class="text-sm text-color-secondary">{{ permission . permision_slug }}</p>
                <p><strong>Description:</strong> {{ permission . permision_desc }}</p>
                <p><strong>Is Menu:</strong> {{ permission . is_menu }}</p>
                <p><strong>Created At:</strong> {{ permission . created_at }}</p>
                <p><strong>Updated At:</strong> {{ permission . updated_at }}</p>
            </div>

            <div class="flex align-items-center gap-2 mt-4">
                <span class="font-medium">Can Be Deleted:</span>

                <Tag :value="permission.can_be_deleted ? 'Yes' : 'No'"
                    :severity="permission.can_be_deleted ? 'success' : 'danger'" icon="pi pi-info-circle" />

                <span v-if="!permission.can_be_deleted" class="text-danger text-sm flex align-items-center gap-1">
                    <i class="pi pi-exclamation-triangle" />
                    Not safe to delete.
                </span>
            </div>
        </div>

        <template #footer>
            <Button label="Delete" icon="pi pi-trash" severity="danger"
                :disabled="!permission.can_be_deleted || buttonLoading" :loading="buttonLoading"
                @click="$emit('delete-permission', permission)" />

            <Button label="Close" icon="pi pi-times" text @click="closeDialog" />
        </template>
    </Dialog>
</template>
