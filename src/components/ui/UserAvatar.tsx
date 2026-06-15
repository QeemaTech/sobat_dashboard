import { Avatar } from '@mui/material';
import { avatarColorFromName, avatarInitial } from '@/utils/avatarUtils';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  singleInitial?: boolean;
}

const sizes = { sm: 32, md: 40, lg: 56 };

export function UserAvatar({ name, size = 'md', singleInitial = false }: UserAvatarProps) {
  const px = sizes[size];
  const initial = avatarInitial(name || '?', singleInitial ? 'single' : 'double');
  const bg = avatarColorFromName(name || '?');

  return (
    <Avatar
      sx={{
        width: px,
        height: px,
        fontSize: singleInitial ? (size === 'sm' ? '0.8rem' : '0.875rem') : size === 'lg' ? '1rem' : '0.75rem',
        fontWeight: 700,
        bgcolor: `${bg}22`,
        color: bg,
        border: `1px solid ${bg}44`,
      }}
    >
      {initial}
    </Avatar>
  );
}
