import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/pages');

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.jsx'))) {
  const fp = path.join(dir, file);
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;

  const spaceMatch = c.match(/return \(\s*<div className="space-y-(4|6)">/);
  if (spaceMatch && !c.includes('PageContainer')) {
    const spacing = spaceMatch[1] === '6' ? 3 : 2;
    c = c.replace(/^(import .+;\n)+/m, (m) => `${m}import { PageContainer } from '../components/layout/PageContainer';\n`);
    c = c.replace(
      /return \(\s*<div className="space-y-(4|6)">([\s\S]*?)<\/div>\s*\);(\s*\n\})/,
      `return (\n    <PageContainer spacing={${spacing}}>$2</PageContainer>\n  );$3`
    );
  }

  if (c.includes('text-rose-400') && !c.includes("from '@mui/material/Typography'")) {
    c = c.replace(/^(import .+;\n)+/m, (m) => `${m}import Typography from '@mui/material/Typography';\n`);
  }
  c = c.replace(/<p className="text-sm text-rose-400">/g, '<Typography variant="body2" color="error">');
  c = c.replace(/<p className="text-rose-400">/g, '<Typography variant="body2" color="error">');
  c = c.replace(/<\/p>(\s*\{?error)/g, '</Typography>$1');

  if (c !== orig) {
    fs.writeFileSync(fp, c);
    console.log('updated', file);
  }
}
