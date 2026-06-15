import { useEffect, useRef, useState } from 'react';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined';
import FormatItalicOutlinedIcon from '@mui/icons-material/FormatItalicOutlined';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import FormatUnderlinedOutlinedIcon from '@mui/icons-material/FormatUnderlinedOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import StrikethroughSOutlinedIcon from '@mui/icons-material/StrikethroughSOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import { Box, Divider, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

function wordCount(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

interface RichHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
  dir?: 'rtl' | 'ltr';
  placeholder?: string;
  minHeight?: string | number;
}

function ToolbarButton({
  title,
  onClick,
  active,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip title={title}>
      <IconButton
        size="small"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        sx={{
          borderRadius: 1,
          bgcolor: active ? 'action.selected' : 'transparent',
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

export function RichHtmlEditor({
  value,
  onChange,
  dir = 'ltr',
  placeholder,
  minHeight = '60vh',
}: RichHtmlEditorProps) {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState(value);

  useEffect(() => {
    if (!sourceMode && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
    setSourceValue(value);
  }, [value, sourceMode]);

  const syncFromEditor = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const exec = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    syncFromEditor();
  };

  const insertLink = () => {
    const url = window.prompt(t('content.editor.linkPrompt'));
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = window.prompt(t('content.editor.imagePrompt'));
    if (url) exec('insertImage', url);
  };

  const insertTable = () => {
    editorRef.current?.focus();
    document.execCommand(
      'insertHTML',
      false,
      '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%"><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table><p></p>'
    );
    syncFromEditor();
  };

  const toggleSource = () => {
    if (sourceMode) {
      onChange(sourceValue);
      setSourceMode(false);
    } else {
      setSourceValue(value);
      setSourceMode(true);
    }
  };

  const words = wordCount(sourceMode ? sourceValue : value);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 0.25,
          px: 1,
          py: 0.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      >
        {!sourceMode && (
          <>
            <ToolbarButton title={t('content.editor.bold')} onClick={() => exec('bold')}>
              <FormatBoldOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <ToolbarButton title={t('content.editor.italic')} onClick={() => exec('italic')}>
              <FormatItalicOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <ToolbarButton title={t('content.editor.underline')} onClick={() => exec('underline')}>
              <FormatUnderlinedOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <ToolbarButton title={t('content.editor.strike')} onClick={() => exec('strikeThrough')}>
              <StrikethroughSOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <ToolbarButton title="H1" onClick={() => exec('formatBlock', 'H1')}>
              <Typography variant="caption" sx={{ fontWeight: 800, px: 0.5 }}>
                H1
              </Typography>
            </ToolbarButton>
            <ToolbarButton title="H2" onClick={() => exec('formatBlock', 'H2')}>
              <Typography variant="caption" sx={{ fontWeight: 800, px: 0.5 }}>
                H2
              </Typography>
            </ToolbarButton>
            <ToolbarButton title="H3" onClick={() => exec('formatBlock', 'H3')}>
              <Typography variant="caption" sx={{ fontWeight: 800, px: 0.5 }}>
                H3
              </Typography>
            </ToolbarButton>
            <ToolbarButton title={t('content.editor.blockquote')} onClick={() => exec('formatBlock', 'blockquote')}>
              <FormatQuoteOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <ToolbarButton title={t('content.editor.code')} onClick={() => exec('formatBlock', 'pre')}>
              <TerminalOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <ToolbarButton title={t('content.editor.link')} onClick={insertLink}>
              <LinkOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <ToolbarButton title={t('content.editor.image')} onClick={insertImage}>
              <ImageOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <ToolbarButton title={t('content.editor.table')} onClick={insertTable}>
              <GridOnOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <ToolbarButton title={t('content.editor.bulletList')} onClick={() => exec('insertUnorderedList')}>
              <FormatListBulletedOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <ToolbarButton title={t('content.editor.numberList')} onClick={() => exec('insertOrderedList')}>
              <FormatListNumberedOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <ToolbarButton title={t('content.editor.undo')} onClick={() => exec('undo')}>
              <UndoOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
            <ToolbarButton title={t('content.editor.redo')} onClick={() => exec('redo')}>
              <RedoOutlinedIcon sx={{ fontSize: 18 }} />
            </ToolbarButton>
          </>
        )}
        <Box sx={{ flex: 1 }} />
        <ToolbarButton title={t('content.editor.viewSource')} onClick={toggleSource} active={sourceMode}>
          <CodeOutlinedIcon sx={{ fontSize: 18 }} />
        </ToolbarButton>
      </Box>

      {sourceMode ? (
        <TextField
          multiline
          fullWidth
          minRows={16}
          value={sourceValue}
          onChange={(e) => {
            setSourceValue(e.target.value);
            onChange(e.target.value);
          }}
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: 'monospace',
              fontSize: 13,
              borderRadius: 0,
              minHeight,
            },
            '& fieldset': { border: 'none' },
          }}
        />
      ) : (
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dir={dir}
          onInput={syncFromEditor}
          data-placeholder={placeholder ?? t('content.editor.placeholder')}
          sx={{
            minHeight,
            px: 2.5,
            py: 2,
            outline: 'none',
            typography: 'body1',
            lineHeight: 1.75,
            '&:empty:before': {
              content: 'attr(data-placeholder)',
              color: 'text.disabled',
            },
            '& h1, & h2, & h3': { fontWeight: 700, mt: 1, mb: 1 },
            '& p': { mb: 1 },
            '& ul, & ol': { pl: 3, mb: 1 },
            '& blockquote': {
              borderLeft: 3,
              borderColor: 'primary.main',
              pl: 2,
              ml: 0,
              color: 'text.secondary',
            },
            '& pre': {
              fontFamily: 'monospace',
              fontSize: 13,
              bgcolor: 'action.hover',
              p: 1.5,
              borderRadius: 1,
              overflow: 'auto',
            },
            '& table': { width: '100%', borderCollapse: 'collapse', mb: 1 },
            '& td, & th': { border: 1, borderColor: 'divider', p: 1 },
          }}
        />
      )}

      <Box sx={{ px: 2, py: 0.75, borderTop: 1, borderColor: 'divider', textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          {t('content.editor.wordCount', { count: words })}
        </Typography>
      </Box>
    </Box>
  );
}
