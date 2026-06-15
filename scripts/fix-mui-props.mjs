import fs from 'fs';
import path from 'path';

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) fixFile(p);
  }
}

function fixFile(file) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;

  // fontWeight={N} -> sx={{ fontWeight: N }} (merge if sx exists on same tag - simple cases)
  s = s.replace(/<Typography([^>]*?) fontWeight=\{(\d+)\}([^>]*)>/g, (m, a, w, b) => {
    if (b.includes('sx={{')) {
      return m.replace(` fontWeight={${w}}`, '').replace('sx={{', `sx={{ fontWeight: ${w}, `);
    }
    return `<Typography${a}${b} sx={{ fontWeight: ${w} }}>`;
  });

  // Stack system props -> sx
  s = s.replace(/<Stack([^>]*?) (justifyContent|alignItems|flexWrap|textAlign)="([^"]+)"([^>]*)>/g, (m, before, prop, val, after) => {
    const sxMatch = after.match(/sx=\{\{([^}]*)\}\}/);
    if (sxMatch) {
      const newAfter = after.replace(/sx=\{\{([^}]*)\}\}/, `sx={{ ${prop}: '${val}', $1 }}`);
      return `<Stack${before}${newAfter}>`;
    }
    return `<Stack${before}${after} sx={{ ${prop}: '${val}' }}>`;
  });

  // noWrap on Typography
  s = s.replace(/<Typography([^>]*?) noWrap([^>]*)>/g, (m, a, b) => {
    if (b.includes('sx={{')) {
      return m.replace(' noWrap', '').replace('sx={{', 'sx={{ whiteSpace: "nowrap", ');
    }
    return `<Typography${a}${b} sx={{ whiteSpace: 'nowrap' }}>`;
  });

  if (s !== orig) {
    fs.writeFileSync(file, s);
    console.log('fixed', file);
  }
}

walk('src');
