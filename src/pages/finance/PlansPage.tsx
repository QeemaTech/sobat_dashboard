import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { financeService } from '@/services/finance.service';
import { formatCurrency, exportCsv } from '@/utils/formatters';
import type { BillingCycle, Plan } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';

const BILLING_CYCLES: BillingCycle[] = ['MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME'];

type FeatureRow = { key: string; value: string };

const emptyForm = () => ({
  nameAr: '',
  nameEn: '',
  descriptionAr: '',
  descriptionEn: '',
  price: '',
  currency: 'SAR',
  billingCycle: 'MONTHLY' as BillingCycle,
  trialDays: '0',
  isActive: true,
  features: [] as FeatureRow[],
});

function featuresToRows(features: Plan['features']): FeatureRow[] {
  if (!features) return [];
  if (Array.isArray(features)) return features.map((v, i) => ({ key: String(i + 1), value: String(v) }));
  return Object.entries(features).map(([key, value]) => ({ key, value: String(value) }));
}

function rowsToFeatures(rows: FeatureRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  rows.forEach((r) => {
    if (r.key.trim()) out[r.key.trim()] = r.value;
  });
  return out;
}

export function PlansPage() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => financeService.listPlans(),
  });

  const saveMut = useMutation({
    mutationFn: () => {
      const body = {
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        descriptionAr: form.descriptionAr || null,
        descriptionEn: form.descriptionEn || null,
        price: Number(form.price),
        currency: form.currency,
        billingCycle: form.billingCycle,
        trialDays: Number(form.trialDays) || 0,
        isActive: form.isActive,
        features: rowsToFeatures(form.features),
      };
      return editId ? financeService.updatePlan(editId, body) : financeService.createPlan(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plans'] });
      setOpen(false);
      setEditId(null);
      setForm(emptyForm());
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => financeService.updatePlan(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => financeService.deletePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plans'] });
      setDeleteId(null);
    },
  });

  function openCreate() {
    setEditId(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditId(plan.id);
    setForm({
      nameAr: plan.nameAr,
      nameEn: plan.nameEn,
      descriptionAr: plan.descriptionAr ?? '',
      descriptionEn: plan.descriptionEn ?? '',
      price: String(plan.price),
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      trialDays: String(plan.trialDays),
      isActive: plan.isActive,
      features: featuresToRows(plan.features),
    });
    setOpen(true);
  }

  function handleExport() {
    exportCsv(
      'plans.csv',
      [
        t('plans.nameAr'),
        t('plans.nameEn'),
        t('plans.price'),
        t('plans.currency'),
        t('plans.billingCycle'),
        t('plans.trialDaysLabel'),
        t('plans.active'),
      ],
      plans.map((plan) => [
        plan.nameAr,
        plan.nameEn,
        String(plan.price),
        plan.currency,
        t(`plans.billing.${plan.billingCycle}`),
        String(plan.trialDays),
        plan.isActive ? t('common.yes') : t('common.no'),
      ])
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={t('finance.plansTitle')}
        actions={
          <Stack direction="row" spacing={1}>
            <ExportCsvButton onClick={handleExport} disabled={!plans.length} />
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={openCreate}>
              {t('plans.add')}
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
        }}
      >
        {plans.map((plan) => {
          const name = isRtl ? plan.nameAr : plan.nameEn;
          const features = featuresToRows(plan.features);
          return (
            <ThemedCard key={plan.id} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" sx={{ mb: 1.5, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isRtl ? plan.nameEn : plan.nameAr}
                  </Typography>
                </Box>
                <Badge label={t(`plans.billing.${plan.billingCycle}`)} />
              </Stack>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                {formatCurrency(Number(plan.price), plan.currency)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('plans.trialDays', { n: plan.trialDays })}
              </Typography>
              {features.length > 0 && (
                <Box component="ul" sx={{ mt: 1.5, flex: 1, m: 0, pl: 2, typography: 'body2', color: 'text.secondary' }}>
                  {features.slice(0, 5).map((f) => (
                    <Box component="li" key={f.key} sx={{ display: 'flex', gap: 0.5 }}>
                      <Typography component="span" color="primary">
                        •
                      </Typography>
                      {f.value || f.key}
                    </Box>
                  ))}
                </Box>
              )}
              <Divider sx={{ mt: 2 }} />
              <Stack direction="row" sx={{ pt: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={plan.isActive}
                      onChange={(e) => toggleMut.mutate({ id: plan.id, isActive: e.target.checked })}
                    />
                  }
                  label={<Typography variant="body2">{t('plans.active')}</Typography>}
                />
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" color="primary" onClick={() => openEdit(plan)}>
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteId(plan.id)}>
                    <Trash2 size={16} />
                  </IconButton>
                </Stack>
              </Stack>
            </ThemedCard>
          );
        })}
      </Box>

      <Modal
        open={open}
        title={editId ? t('plans.edit') : t('plans.add')}
        onClose={() => setOpen(false)}
        size="lg"
        footer={
          <Button variant="contained" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            {t('common.save')}
          </Button>
        }
      >
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField size="small" placeholder={t('plans.nameAr')} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
          <TextField size="small" placeholder={t('plans.nameEn')} value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          <TextField size="small" sx={{ gridColumn: { sm: 'span 2' } }} multiline rows={2} placeholder={t('plans.descAr')} value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
          <TextField size="small" sx={{ gridColumn: { sm: 'span 2' } }} multiline rows={2} placeholder={t('plans.descEn')} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          <TextField size="small" type="number" placeholder={t('plans.price')} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <TextField size="small" placeholder={t('plans.currency')} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          <FormControl size="small" fullWidth>
            <InputLabel>{t('plans.billing.MONTHLY')}</InputLabel>
            <MuiSelect
              label={t('plans.billing.MONTHLY')}
              value={form.billingCycle}
              onChange={(e) => setForm({ ...form, billingCycle: e.target.value as BillingCycle })}
            >
              {BILLING_CYCLES.map((c) => (
                <MenuItem key={c} value={c}>
                  {t(`plans.billing.${c}`)}
                </MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
          <TextField size="small" type="number" placeholder={t('plans.trialDaysLabel')} value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: e.target.value })} />
          <FormControlLabel
            sx={{ gridColumn: { sm: 'span 2' } }}
            control={<Checkbox checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
            label={<Typography variant="body2">{t('plans.active')}</Typography>}
          />
          <Box sx={{ gridColumn: { sm: 'span 2' } }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              {t('plans.features')}
            </Typography>
            {form.features.map((f, i) => (
              <Stack key={i} direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={t('plans.featureKey')}
                  value={f.key}
                  onChange={(e) => {
                    const features = [...form.features];
                    features[i] = { ...f, key: e.target.value };
                    setForm({ ...form, features });
                  }}
                />
                <TextField
                  size="small"
                  fullWidth
                  placeholder={t('plans.featureValue')}
                  value={f.value}
                  onChange={(e) => {
                    const features = [...form.features];
                    features[i] = { ...f, value: e.target.value };
                    setForm({ ...form, features });
                  }}
                />
                <IconButton color="error" onClick={() => setForm({ ...form, features: form.features.filter((_, j) => j !== i) })}>
                  ×
                </IconButton>
              </Stack>
            ))}
            <Button size="small" onClick={() => setForm({ ...form, features: [...form.features, { key: '', value: '' }] })}>
              + {t('plans.addFeature')}
            </Button>
          </Box>
        </Box>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title={t('plans.deleteTitle')}
        message={t('plans.deleteMessage')}
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </Box>
  );
}
