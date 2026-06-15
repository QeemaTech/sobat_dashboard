import { api, unwrap, unwrapPaginated } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type { Permission, Role } from '@/types';

export const rolesService = {
  list(params?: Record<string, string | number>) {
    return unwrapPaginated<Role>(api.get(`${ADMIN_PREFIX}/roles`, { params }));
  },

  create(body: Record<string, unknown>) {
    return unwrap<{ role: Role }>(api.post(`${ADMIN_PREFIX}/roles`, body));
  },

  update(id: string, body: Record<string, unknown>) {
    return unwrap<{ role: Role }>(api.put(`${ADMIN_PREFIX}/roles/${id}`, body));
  },

  remove(id: string) {
    return unwrap(api.delete(`${ADMIN_PREFIX}/roles/${id}`));
  },

  setPermissions(id: string, permissionKeys: string[]) {
    return unwrap<{ role: Role }>(api.put(`${ADMIN_PREFIX}/roles/${id}/permissions`, { permissionKeys }));
  },

  async listPermissions() {
    const first = await unwrapPaginated<Permission>(
      api.get(`${ADMIN_PREFIX}/permissions`, { params: { limit: 100, page: 1 } })
    );
    if (first.meta.totalPages <= 1) return first.data;
    const rest = await Promise.all(
      Array.from({ length: first.meta.totalPages - 1 }, (_, i) =>
        unwrapPaginated<Permission>(
          api.get(`${ADMIN_PREFIX}/permissions`, { params: { limit: 100, page: i + 2 } })
        )
      )
    );
    return [...first.data, ...rest.flatMap((page) => page.data)];
  },
};
