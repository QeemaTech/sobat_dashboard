import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Breadcrumbs, Link, Typography, useTheme } from '@mui/material';
import { ROUTE_LABELS } from '@/config/navigation';
import { isUuidSegment, useBreadcrumbStore } from '@/store/breadcrumbStore';

export function AppBreadcrumbs() {
  const { t } = useTranslation();
  const theme = useTheme();
  const location = useLocation();
  const customLabels = useBreadcrumbStore((s) => s.labels);
  const parts = location.pathname.split('/').filter(Boolean);

  if (parts.length <= 1) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {t('nav.dashboard')}
      </Typography>
    );
  }

  const crumbs: { path: string; label: string }[] = [];
  let acc = '';
  for (const part of parts) {
    acc += `/${part}`;
    const labelKey = ROUTE_LABELS[acc];
    const custom = customLabels[acc];
    let label = custom ?? (labelKey ? t(labelKey) : part);
    if (!custom && !labelKey && isUuidSegment(part)) {
      label = t('common.details');
    }
    crumbs.push({ path: acc, label });
  }

  return (
    <Breadcrumbs
      separator={
        theme.direction === 'rtl' ? (
          <NavigateBeforeRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
        ) : (
          <NavigateNextRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
        )
      }
      sx={{ '& .MuiBreadcrumbs-li': { display: 'flex', alignItems: 'center' } }}
    >
      <Link component={RouterLink} to="/admin" underline="hover" color="text.secondary" variant="body2">
        {t('nav.dashboard')}
      </Link>
      {crumbs.slice(1).map((crumb, i) => {
        const isLast = i === crumbs.length - 2;
        if (isLast) {
          return (
            <Typography
              key={crumb.path}
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: 600, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {crumb.label}
            </Typography>
          );
        }
        return (
          <Link key={crumb.path} component={RouterLink} to={crumb.path} underline="hover" color="text.secondary" variant="body2">
            {crumb.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
