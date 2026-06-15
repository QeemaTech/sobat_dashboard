const AVATAR_COLORS = ['#6366f1', '#3b82f6', '#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899', '#0ea5e9', '#22c55e'];

export function avatarColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Single initial for avatars — avoids truncated Arabic word fragments in small circles. */
export function avatarInitial(name: string, mode: 'single' | 'double' = 'single'): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (mode === 'single') return parts[0].charAt(0);
  if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
  return parts[0].charAt(0);
}
