import axios, { type AxiosError } from 'axios';
import i18n from '@/i18n';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/utils/constants';
import type { ApiResponse, PaginationMeta } from '@/types';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;
    if (status === 401) {
      useAuthStore.getState().clearSession();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const msg = error.response?.data?.message;
    const message = msg || i18n.t('common.error');
    return Promise.reject(new Error(message));
  }
);

export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.success) throw new Error(data.message || i18n.t('common.error'));
  return data.data;
}

export async function unwrapPaginated<T>(
  promise: Promise<{ data: ApiResponse<T[]> }>
): Promise<{ data: T[]; meta: PaginationMeta }> {
  const { data } = await promise;
  if (!data.success) throw new Error(data.message || i18n.t('common.error'));
  const pagination = data.meta?.pagination;
  return {
    data: data.data ?? [],
    meta: pagination ?? { page: 1, limit: 20, total: data.data?.length ?? 0, totalPages: 1 },
  };
}
