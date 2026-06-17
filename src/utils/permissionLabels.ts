import type { TFunction } from 'i18next';
import type { Permission, Role } from '@/types';

export function getPermissionModuleLabel(module: string, t: TFunction): string {
  const key = `permissions.modules.${module}`;
  const label = t(key);
  return label !== key ? label : module.replace(/_/g, ' ');
}

export function getPermissionActionLabel(perm: Permission, t: TFunction): string {
  const action = perm.key.split('.').pop() ?? perm.key;
  const key = `permissions.actions.${action}`;
  const label = t(key);
  return label !== key ? label : action;
}

export function getPermissionLabel(perm: Permission, lang: 'ar' | 'en', t: TFunction): string {
  if (lang === 'ar') return perm.nameAr || perm.name;
  const key = `permissions.permissionNames.${perm.key}`;
  const label = t(key);
  return label !== key ? label : perm.name || perm.nameAr || perm.key;
}

export function getRoleLabel(role: Role, lang: 'ar' | 'en', t?: TFunction): string {
  if (lang === 'ar') return role.nameAr || role.name;

  const key = `permissions.roles.${role.name}`;
  if (t) {
    const label = t(key);
    if (label !== key) return label;
  }
  return role.name || role.nameAr;
}
