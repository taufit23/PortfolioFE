import { useRuntimeConfig, useCookie, useNuxtApp } from '#app'

export function useUserManagement() {
  const config = useRuntimeConfig()
  const baseURL: string = config.public.API_BASE_URL
  const token = useCookie<string>("token");

  const { $showToast } = useNuxtApp();

  interface APIResponse<T> {
    data: T;
    statusMessage?: string;
  }

  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
  }

  interface NewUser {
    name: string;
    email: string;
    password: string;
    role: string;
  }

  // Fetch daftar users
  async function fetchUser(): Promise<User[]> {
    try
    {
      const data: APIResponse<User[]> = await $fetch(
        `${baseURL}user-management`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.value?.trim()}`,
            Accept: "application/json",
          },
        }
      );
      return data?.data || [];
    } catch (err: any)
    {
      $showToast("error", "Error", err?.response?._data?.message);
      return [];
    }
  }

  // Fetch roles
  async function fetchUserRoles(): Promise<string[]> {
    try
    {
      const data: APIResponse<string[]> = await $fetch(
        `${baseURL}manage-roles`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.value?.trim()}`,
            Accept: "application/json",
          },
        }
      );
      return data?.data || [];
    } catch (err: any)
    {
      $showToast("error", "Error", err?.response?._data?.message);
      return [];
    }
  }

  // Fetch permissions
  async function fetchUserPermissions(): Promise<string[]> {
    try
    {
      const data: APIResponse<string[]> = await $fetch(
        `${baseURL}manage-permissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.value?.trim()}`,
            Accept: "application/json",
          },
        }
      );
      return data?.data || [];
    } catch (err: any)
    {
      $showToast("error", "Error", err?.response?._data?.message);
      return [];
    }
  }

  // Create new user
  async function saveNewUser(
    newUser: NewUser,
    users: Ref<User[]>,
    closeDialog: () => void,
    resetForm: () => void
  ): Promise<void> {
    try
    {
      const response: APIResponse<User> = await $fetch(
        `${baseURL}user-management/createUser`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.value?.trim()}`,
            "Content-Type": "application/json",
          },
          body: newUser,
        }
      );

      if (response)
      {
        users.value.push(response.data);
        $showToast("success", "Success", "User successfully created!");
        closeDialog();
        resetForm();
      }
    } catch (err: any)
    {
      const errorMessage = err?.response?._data?.message || "-";
      $showToast("error", "Error", errorMessage);
    }
  }

  // Update user
  async function saveEditedUser(
    editedUser: User,
    users: Ref<User[]>,
    closeDialog: () => void
  ): Promise<void> {
    try
    {
      await $fetch(`${baseURL}user-management/updateUser`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.value?.trim()}`,
          "Content-Type": "application/json",
        },
        body: editedUser,
      });

      const index = users.value.findIndex((u) => u.id === editedUser.id);
      if (index !== -1) users.value[index] = { ...editedUser };

      $showToast("success", "Success", "User successfully updated!");
      closeDialog();
    } catch (err: any)
    {
      $showToast("error", "Error", err.message);
    }
  }

  // Fetch user detail
  async function showDetailUser(user: { id: number }): Promise<User | null> {
    try
    {
      const data: APIResponse<User> = await $fetch(
        `${baseURL}user-management/showUser`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.value?.trim()}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      $showToast("success", "Success", data.statusMessage);
      return data?.data || null;
    } catch (err: any)
    {
      $showToast("error", "Error", err?.response?._data?.message);
      return null;
    }
  }

  return {
    fetchUser,
    fetchUserRoles,
    fetchUserPermissions,
    saveNewUser,
    saveEditedUser,
    showDetailUser,
  };
}
