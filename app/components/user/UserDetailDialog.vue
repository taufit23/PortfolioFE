<script setup>
import { defineProps, defineEmits } from 'vue'

// Props untuk menerima data dari parent
const props = defineProps({
  visible: Boolean, // Status dialog (open/close)
  user: Object, // Data user yang akan ditampilkan
})

// Emit untuk menutup dialog dan aksi lain
const emit = defineEmits(['update:visible', 'edit-user', 'delete-user'])

function closeDialog() {
  emit('update:visible', false)
}

function editUser() {
  emit('edit-user', props.user)
}

function deleteUser() {
  emit('delete-user', props.user)
}
</script>

<template>
  <Dialog
    v-model:visible="props.visible"
    :style="{ width: '50vw' }"
    header="User Detail"
    :modal="true"
  >
    <div v-if="user">
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Last Login:</strong> {{ user.last_login }}</p>
      <p><strong>Status:</strong> {{ user.status ? 'Active' : 'Inactive' }}</p>
      <p>
        <strong>Login Status:</strong>
        <span :class="user.login_status ? 'text-green-500' : 'text-red-500'">
          {{ user.login_status ? 'Online' : 'Offline' }}
        </span>
      </p>

      <!-- Roles Section -->
      <div v-if="user.roles && user.roles.length">
        <h3 class="mt-4">
          Roles
        </h3>
        <ul>
          <li
            v-for="role in user.roles"
            :key="role.role_name"
          >
            <strong>{{ role.role_name }}</strong> - {{ role.role_desc }}
          </li>
        </ul>

        <!-- Permissions per Role -->
        <div
          v-for="role in user.roles"
          :key="role.role_name"
        >
          <h4 class="mt-2">
            Permissions for {{ role.role_name }}
          </h4>
          <ul v-if="role.permision && role.permision.length">
            <li
              v-for="perm in role.permision"
              :key="perm.permision_slug"
            >
              <strong>{{ perm.permision_name }}</strong> - {{ perm.permision_desc }}
            </li>
          </ul>
          <p v-else>
            No permissions assigned.
          </p>
        </div>
      </div>
      <p v-else>
        No roles assigned.
      </p>
    </div>

    <template #footer>
      <Button
        icon="pi pi-pencil"
        outlined
        rounded
        class="mr-2"
        @click="editUser"
      />
      <Button
        icon="pi pi-trash"
        outlined
        rounded
        class="mr-2"
        severity="danger"
        @click="deleteUser"
      />
      <Button
        label="Close"
        icon="pi pi-times"
        text
        @click="closeDialog"
      />
    </template>
  </Dialog>
</template>
