import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIcon from '@mui/icons-material/Circle';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RichHtmlEditor } from '@/components/content/RichHtmlEditor';
import { contentService } from '@/services/content.service';
import type { ContentPageItem, ContentStatus } from '@/types';
import { formatRelativeTime } from '@/utils/formatters';
import { slugify } from '@/utils/slugify';
import { API_BASE_URL } from '@/utils/constants';

export interface PageFormState {
  slug: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  status: ContentStatus;
  sortOrder: string;
}

interface PageEditorProps {
  page: ContentPageItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const STATUS_DOT: Record<ContentStatus, string> = {
  PUBLISHED: '#22c55e',
  DRAFT: '#eab308',
  ARCHIVED: '#ef4444',
};

function formFromPage(page: ContentPageItem | null): PageFormState {
  if (!page?.id) {
    return { slug: '', titleAr: '', titleEn: '', contentAr: '', contentEn: '', status: 'DRAFT', sortOrder: '0' };
  }
  return {
    slug: page.slug,
    titleAr: page.titleAr,
    titleEn: page.titleEn ?? '',
    contentAr: page.contentAr,
    contentEn: page.contentEn ?? '',
    status: page.status,
    sortOrder: String(page.sortOrder),
  };
}

function formsEqual(a: PageFormState, b: PageFormState) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function PageEditor({ page, onClose, onSaved }: PageEditorProps) {
  const { t } = useTranslation();
  const baseline = useMemo(() => formFromPage(page), [page]);
  const [form, setForm] = useState<PageFormState>(baseline);
  const [savedBaseline, setSavedBaseline] = useState<PageFormState>(baseline);
  const [slugTouched, setSlugTouched] = useState(!!page?.id);
  const [langTab, setLangTab] = useState<'ar' | 'en'>('ar');
  const [saving, setSaving] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const pageIdRef = useRef(page?.id);

  const dirty = !formsEqual(form, savedBaseline);
  const isPublished = form.status === 'PUBLISHED';

  useEffect(() => {
    pageIdRef.current = page?.id;
  }, [page?.id]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const handleSave = useCallback(
    async (publish: boolean, silent = false) => {
      if (!form.slug.trim() || !form.titleAr.trim()) {
        if (!silent) setToast({ msg: t('content.editor.validation'), severity: 'error' });
        return;
      }
      setSaving(true);
      try {
        const nextStatus = publish ? ('PUBLISHED' as const) : form.status;
        const payload = {
          ...form,
          status: nextStatus,
          sortOrder: Number(form.sortOrder) || 0,
        };
        if (pageIdRef.current) {
          await contentService.updatePage(pageIdRef.current, payload);
        } else {
          const result = (await contentService.createPage(payload)) as { item?: { id?: string } };
          if (result?.item?.id) pageIdRef.current = result.item.id;
        }
        const nextForm = { ...form, status: nextStatus };
        setForm(nextForm);
        setSavedBaseline(nextForm);
        setAutoSavedAt(new Date().toISOString());
        onSaved();
        if (!silent) {
          setToast({ msg: t('content.editor.saveSuccess'), severity: 'success' });
        }
      } catch (e) {
        if (!silent) setToast({ msg: (e as Error).message || t('content.editor.saveError'), severity: 'error' });
      } finally {
        setSaving(false);
      }
    },
    [form, onClose, onSaved, t]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        void handleSave(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  useEffect(() => {
    if (!dirty || !pageIdRef.current) return undefined;
    const timer = window.setInterval(() => {
      void handleSave(false, true);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [dirty, handleSave]);

  const patchForm = useCallback((patch: Partial<PageFormState>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.titleEn !== undefined && !slugTouched) {
        next.slug = slugify(patch.titleEn);
      }
      return next;
    });
  }, [slugTouched]);

  function openPreview() {
    const html = langTab === 'ar' ? form.contentAr : form.contentEn || form.contentAr;
    const title = langTab === 'ar' ? form.titleAr : form.titleEn || form.titleAr;
    const dir = langTab === 'ar' ? 'rtl' : 'ltr';
    const doc = `<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:sans-serif;padding:2rem;max-width:720px;margin:0 auto">${html}</body></html>`;
    const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function openLivePreview() {
    if (form.status === 'PUBLISHED' && form.slug) {
      window.open(`${API_BASE_URL}/content/pages/${form.slug}`, '_blank', 'noopener');
    } else {
      openPreview();
    }
  }

  function requestClose() {
    if (dirty) setLeaveConfirm(true);
    else onClose();
  }

  const displayTitle = form.titleEn || form.titleAr || t('content.addPage');

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={requestClose} color="inherit">
          {t('content.editor.back')}
        </Button>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
          {dirty && <CircleIcon sx={{ fontSize: 10, color: 'warning.main' }} />}
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            {displayTitle}
          </Typography>
        </Box>

        {autoSavedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
            {t('content.editor.autoSaved', { time: formatRelativeTime(autoSavedAt) })}
          </Typography>
        )}

        <Button startIcon={<OpenInNewOutlinedIcon />} onClick={openLivePreview} variant="outlined" size="small">
          {t('content.preview')}
        </Button>
        <Button variant="outlined" size="small" disabled={saving} onClick={() => handleSave(false)}>
          {t('content.editor.saveDraft')}
        </Button>
        <Button variant="contained" size="small" disabled={saving} onClick={() => handleSave(true)}>
          {t('content.editor.publish')}
        </Button>
      </Box>

      {isPublished && (
        <Alert severity="warning" sx={{ borderRadius: 0 }}>
          {t('content.editor.liveWarning')}
        </Alert>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 0, overflow: 'hidden' }}>
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: 280 },
            flexShrink: 0,
            borderRight: { md: 1 },
            borderBottom: { xs: 1, md: 0 },
            borderColor: 'divider',
            borderRadius: 0,
            p: 2.5,
            overflowY: 'auto',
            maxHeight: { xs: '40vh', md: 'none' },
          }}
        >
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
            {t('content.editor.sidebarTitle')}
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('common.status')}</InputLabel>
              <Select
                label={t('common.status')}
                value={form.status}
                onChange={(e) => patchForm({ status: e.target.value as ContentStatus })}
                renderValue={(v) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircleIcon sx={{ fontSize: 10, color: STATUS_DOT[v as ContentStatus] }} />
                    {t(`contentStatus.${v}`)}
                  </Box>
                )}
              >
                {(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((s) => (
                  <MenuItem key={s} value={s}>
                    <CircleIcon sx={{ fontSize: 10, color: STATUS_DOT[s], mr: 1 }} />
                    {t(`contentStatus.${s}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              fullWidth
              label={t('content.slug')}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                patchForm({ slug: slugify(e.target.value) });
              }}
              disabled={!!page?.id}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">/</InputAdornment>,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t('content.editor.urlPreview', { slug: form.slug || '…' })}
            </Typography>

            <TextField
              size="small"
              fullWidth
              label={t('content.titleAr')}
              value={form.titleAr}
              onChange={(e) => patchForm({ titleAr: e.target.value })}
              slotProps={{ htmlInput: { dir: 'rtl' } }}
            />
            <TextField
              size="small"
              fullWidth
              label={t('content.titleEn')}
              value={form.titleEn}
              onChange={(e) => patchForm({ titleEn: e.target.value })}
              slotProps={{ htmlInput: { dir: 'ltr' } }}
            />

            {page?.id && (
              <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                {page.createdAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {t('content.editor.created', { time: formatRelativeTime(page.createdAt) })}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {t('content.editor.lastUpdated', { time: formatRelativeTime(page.updatedAt) })}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {t('content.editor.order', { n: page.sortOrder })}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, p: { xs: 2, md: 3 } }}>
          <Tabs
            value={langTab}
            onChange={(_, v) => setLangTab(v)}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', minHeight: 44 }}
          >
            <Tab value="ar" label={t('content.editor.tabAr')} sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab value="en" label={t('content.editor.tabEn')} sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

          {langTab === 'ar' ? (
            <RichHtmlEditor
              value={form.contentAr}
              onChange={(html) => patchForm({ contentAr: html })}
              dir="rtl"
              minHeight="calc(100vh - 220px)"
            />
          ) : (
            <RichHtmlEditor
              value={form.contentEn}
              onChange={(html) => patchForm({ contentEn: html })}
              dir="ltr"
              minHeight="calc(100vh - 220px)"
            />
          )}
        </Box>
      </Box>

      <ConfirmDialog
        open={leaveConfirm}
        title={t('content.editor.leaveTitle')}
        message={t('content.editor.leaveMessage')}
        destructive
        onCancel={() => setLeaveConfirm(false)}
        onConfirm={() => {
          setLeaveConfirm(false);
          onClose();
        }}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity ?? 'success'} onClose={() => setToast(null)}>
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
