import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/pages');

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.jsx'))) {
  const fp = path.join(dir, file);
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;

  if (c.includes('<PageContainer') && !c.includes("layout/PageContainer")) {
    c = `import { PageContainer } from '../components/layout/PageContainer';\n${c}`;
  }
  if (c.includes('<Typography') && !c.includes("@mui/material/Typography")) {
    c = `import Typography from '@mui/material/Typography';\n${c}`;
  }
  if (c.includes('<Stack') && !c.includes("@mui/material/Stack")) {
    c = `import Stack from '@mui/material/Stack';\n${c}`;
  }
  if (c.includes('<Grid') && !c.includes("@mui/material/Grid")) {
    c = `import Grid from '@mui/material/Grid';\n${c}`;
  }
  if (c.includes('<Box') && !c.includes("@mui/material/Box")) {
    c = `import Box from '@mui/material/Box';\n${c}`;
  }
  if (c.includes('<Paper') && !c.includes("@mui/material/Paper")) {
    c = `import Paper from '@mui/material/Paper';\n${c}`;
  }

  if (c !== orig) {
    fs.writeFileSync(fp, c);
    console.log('fixed', file);
  }
}
