export const useApi = () => {
  const config = useRuntimeConfig();
  const token = useCookie("token");
  const baseURL = config.public.API_BASE_URL;

  const headers = {
    Authorization: `Bearer ${token.value?.trim() || ""}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const handleApiError = (err: any) => {
    const { $showToast } = useNuxtApp();
    const message =
      err?.response?._data?.message ||
      Object.values(err?.response?._data?.errors || {})
        .flat()
        .join("\n") ||
      "Terjadi kesalahan.";
    $showToast("error", "Error", message);
    throw err;
  };

  const get = async (url: string, params?: any) => {
    try
    {
      return await $fetch(`${baseURL}${url}`, {
        method: "GET",
        headers,
        params,
      });
    } catch (err)
    {
      handleApiError(err);
    }
  };

  const post = async (url: string, body?: any) => {
    try
    {
      return await $fetch(`${baseURL}${url}`, {
        method: "POST",
        headers,
        body,
      });
    } catch (err)
    {
      handleApiError(err);
    }
  };

  const put = async (url: string, body?: any) => {
    try
    {
      return await $fetch(`${baseURL}${url}`, {
        method: "PUT",
        headers,
        body,
      });
    } catch (err)
    {
      handleApiError(err);
    }
  };

  const patch = async (url: string, body?: any) => {
    try
    {
      return await $fetch(`${baseURL}${url}`, {
        method: "PATCH",
        headers,
        body,
      });
    } catch (err)
    {
      handleApiError(err);
    }
  };

  const del = async (url: string, body?: any) => {
    try
    {
      return await $fetch(`${baseURL}${url}`, {
        method: "DELETE",
        headers,
        body,
      });
    } catch (err)
    {
      handleApiError(err);
    }
  };

  return { get, post, put, patch, del };
};
