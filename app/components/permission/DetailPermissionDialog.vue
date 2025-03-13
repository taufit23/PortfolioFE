<script setup>
    import {
        defineProps,
        defineEmits
    } from 'vue'

    const props = defineProps({
        visible: Boolean,
        permission: Object,
    })

    const emit = defineEmits(['update:visible', 'detail-permission'])

    function closeDialog() {
        emit('update:visible', false)
    }
</script>

<template>
    <Dialog v-model:visible="props.visible" :style="{ width: '50vw' }" header="Detail Permission" :modal="true">
        <div>
            <p><strong>Permission Name:</strong> {{ permission . permision_name }}</p>
            <p><strong>Permission slug:</strong> {{ permission . permision_slug }}</p>
            <p><strong>Is Menu:</strong> {{ permission . is_menu }}</p>
            <p><strong>Permission Desc:</strong> {{ permission . permision_desc }}</p>
            <p><strong>Craeted At:</strong> {{ permission . created_at }}</p>
            <p><strong>Updated At:</strong> {{ permission . updated_at }}</p>
        </div>
        <template #footer>
            <Button label="Close" icon="pi pi-times" text @click="closeDialog" />
        </template>
    </Dialog>
</template>
