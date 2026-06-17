import type { Permission } from '@/types';

export const MATRIX_ACTION_ORDER = ['create', 'delete', 'update', 'read', 'manage', 'send'] as const;
export type MatrixAction = (typeof MATRIX_ACTION_ORDER)[number];

export function getPermissionAction(key: string): string {
  return key.split('.').pop() ?? key;
}

export function buildModuleMatrix(modules: [string, Permission[]][]) {
  const allActions = new Set<MatrixAction>();
  const byModule = new Map<string, Map<MatrixAction, Permission>>();

  for (const [module, perms] of modules) {
    const actionMap = new Map<MatrixAction, Permission>();
    for (const p of perms) {
      const action = getPermissionAction(p.key) as MatrixAction;
      if (MATRIX_ACTION_ORDER.includes(action)) {
        actionMap.set(action, p);
        allActions.add(action);
      }
    }
    byModule.set(module, actionMap);
  }

  const columns = MATRIX_ACTION_ORDER.filter((action) => allActions.has(action));
  return { byModule, columns };
}

export function getMatrixColumnLabelKey(action: MatrixAction): string {
  if (action === 'update') return 'permissions.columns.edit';
  if (action === 'read') return 'permissions.columns.view';
  return `permissions.columns.${action}`;
}
