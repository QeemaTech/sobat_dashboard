import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import { Box, SvgIcon } from '@mui/material';
import { useTranslation } from 'react-i18next';

const METHOD_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  CREDIT_CARD: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)' },
  APPLE_PAY: { color: '#ffffff', bg: '#000000', border: 'rgba(255,255,255,0.12)' },
  GOOGLE_PAY: { color: '#4285f4', bg: 'rgba(66,133,244,0.12)', border: 'rgba(66,133,244,0.35)' },
  BANK_TRANSFER: { color: '#14b8a6', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.35)' },
  OTHER: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)' },
};

function AppleLogoIcon() {
  return (
    <SvgIcon sx={{ fontSize: 15 }} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </SvgIcon>
  );
}

function MethodIcon({ method }: { method: string }) {
  const sx = { fontSize: 16 };
  switch (method) {
    case 'APPLE_PAY':
      return <AppleLogoIcon />;
    case 'GOOGLE_PAY':
      return <WalletOutlinedIcon sx={sx} />;
    case 'BANK_TRANSFER':
      return <AccountBalanceOutlinedIcon sx={sx} />;
    case 'CREDIT_CARD':
      return <CreditCardOutlinedIcon sx={sx} />;
    default:
      return <CreditCardOutlinedIcon sx={sx} />;
  }
}

export function PaymentMethodBadge({ method }: { method: string }) {
  const { t } = useTranslation();
  const key = method in METHOD_STYLE ? method : 'OTHER';
  const style = METHOD_STYLE[key];
  const isApplePay = key === 'APPLE_PAY';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isApplePay ? 0.5 : 0.75,
        px: isApplePay ? 1 : 1.25,
        py: 0.35,
        borderRadius: isApplePay ? 1 : 9999,
        fontSize: isApplePay ? 11 : 12,
        fontWeight: isApplePay ? 500 : 600,
        letterSpacing: isApplePay ? 0.4 : 0.2,
        color: style.color,
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
        fontFamily: isApplePay ? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' : 'inherit',
      }}
    >
      <MethodIcon method={key} />
      {isApplePay ? (
        <>
          <Box component="span" sx={{ fontWeight: 600 }}>
            Pay
          </Box>
        </>
      ) : (
        t(`paymentMethod.${method}`, method)
      )}
    </Box>
  );
}
