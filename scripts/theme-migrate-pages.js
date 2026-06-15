import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, '../src/pages');

const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.jsx'));

for (const file of files) {
  const fp = path.join(pagesDir, file);
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;

  // AppLink for table user links
  c = c.replace(
    /<Link\s+to=\{ROUTES\.userDetail\(r\.userId\)\}\s+className="block max-w-\[220px\] truncate text-brand-glow hover:underline"\s*>\s*([\s\S]*?)<\/Link>/g,
    '<AppLink to={ROUTES.userDetail(r.userId)}>$1</AppLink>'
  );
  c = c.replace(
    /<Link\s+to=\{ROUTES\.userDetail\(r\.user\?\.id\)\}\s+className="block max-w-\[220px\] truncate text-brand-glow hover:underline"\s*>\s*([\s\S]*?)<\/Link>/g,
    '<AppLink to={ROUTES.userDetail(r.user?.id)}>$1</AppLink>'
  );
  c = c.replace(
    /<Link\s+to=\{ROUTES\.userDetail\(row\.userId\)\}\s+className="block max-w-\[200px\] truncate text-brand-glow hover:underline"\s*>\s*([\s\S]*?)<\/Link>/g,
    '<AppLink to={ROUTES.userDetail(row.userId)}>$1</AppLink>'
  );

  if (c.includes('<AppLink') && !c.includes("AppLink } from")) {
    c = c.replace(/^(import .+;\n)/m, "$1import { AppLink } from '../components/ui/AppLink';\n");
  }

  // textareas -> TextArea
  c = c.replace(
    /<textarea([^>]*?)className="[^"]*"([^>]*)\/>/g,
    '<TextArea$1$2 />'
  );
  c = c.replace(
    /<textarea([^>]*?)className="[^"]*"([^>]*)><\/textarea>/g,
    '<TextArea$1$2></TextArea>'
  );

  if (c.includes('<TextArea') && !c.includes("TextArea } from")) {
    c = c.replace(/^(import .+;\n)/m, "$1import { TextArea } from '../components/ui/TextArea';\n");
  }

  // section cards
  c = c.replace(
    /<section className="rounded-xl border border-surface-border[^"]*p-4"([^>]*)>/g,
    '<SectionCard$1>'
  );
  c = c.replace(/<\/section>/g, '</SectionCard>');

  c = c.replace(
    /<div className="rounded-xl border border-surface-border bg-navy-900\/40 p-3">/g,
    '<SectionCard sx={{ p: 1.5 }}>'
  );
  c = c.replace(
    /<div className="rounded-xl border border-surface-border bg-navy-900\/40 p-4[^"]*">/g,
    '<SectionCard>'
  );

  if (c.includes('<SectionCard') && !c.includes("SectionCard } from")) {
    c = c.replace(/^(import .+;\n)/m, "$1import { SectionCard } from '../components/ui/SectionCard';\n");
  }

  // forms
  c = c.replace(
    /<form className="max-w-xl space-y-3 rounded-2xl border border-surface-border bg-navy-900\/40 p-5" onSubmit=\{([^}]+)\}>/g,
    '<FormSection maxWidth={520} onSubmit={$1}>'
  );
  c = c.replace(
    /<form className="space-y-2 rounded-xl border border-surface-border p-4" onSubmit=\{([^}]+)\}>/g,
    '<FormSection onSubmit={$1}>'
  );
  c = c.replace(
    /<form className="flex flex-wrap items-end gap-2 rounded-xl border border-surface-border p-4" onSubmit=\{([^}]+)\}>/g,
    '<FormSection onSubmit={$1} sx={{ flexDirection: \'row\', flexWrap: \'wrap\', gap: 2 }}>'
  );

  if (c.includes('<FormSection') && !c.includes("FormSection } from")) {
    c = c.replace(/^(import .+;\n)/m, "$1import { FormSection } from '../components/ui/FormSection';\n");
  }

  // close form tags that became FormSection
  if (c.includes('<FormSection')) {
    c = c.replace(/<\/form>/g, '</FormSection>');
  }

  // monospace textareas in role detail
  c = c.replace(
    /<textarea[^>]*className="min-h-\[200px\][^"]*"[^>]*\/>/g,
    '<MonospaceArea minRows={8} />'
  );

  if (c.includes('<MonospaceArea') && !c.includes("MonospaceArea } from")) {
    c = c.replace(/^(import .+;\n)/m, "$1import { MonospaceArea } from '../components/ui/MonospaceArea';\n");
  }

  // empty state paragraphs
  c = c.replace(/<p className="text-slate-500">([^<]+)<\/p>/g, '<EmptyState title="$1" />');
  if (c.includes('<EmptyState title=') && !c.includes("EmptyState } from") && !c.includes('EmptyState from')) {
    if (!c.includes("ui/EmptyState")) {
      c = c.replace(/^(import .+;\n)/m, "$1import { EmptyState } from '../components/ui/EmptyState';\n");
    }
  }

  if (c !== orig) {
    fs.writeFileSync(fp, c);
    console.log('migrated', file);
  }
}
