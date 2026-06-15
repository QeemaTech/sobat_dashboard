import { api, unwrap } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type { LoginResponse } from '@/types';

export const authService = {
  login(email: string, password: string) {
    return unwrap<LoginResponse>(
      api.post(`${ADMIN_PREFIX}/auth/login`, { email, password })
    );
  },

  me() {
    return unwrap<{ admin: LoginResponse['admin'] }>(
      api.get(`${ADMIN_PREFIX}/auth/me`)
    ).then((d) => d.admin);
  },

  logout() {
    return api.post(`${ADMIN_PREFIX}/auth/logout`).catch(() => undefined);
  },
};
