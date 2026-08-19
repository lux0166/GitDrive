import fs from 'fs';
import path from 'path';

const CLIENT_DIST = path.resolve('client/dist');
const OUTPUT_FILE = path.resolve('server/src/embedded-client.ts');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

function collectFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.posix.join(base, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectFiles(fullPath, relPath));
    } else {
      result.push({ fullPath, relPath: '/' + relPath });
    }
  }
  return result;
}

if (!fs.existsSync(CLIENT_DIST)) {
  console.error('client/dist does not exist. Run npm run build in client first.');
  process.exit(1);
}

const files = collectFiles(CLIENT_DIST);
const assets = {};

for (const f of files) {
  const ext = path.extname(f.fullPath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const isBinary = !['.html', '.js', '.css', '.svg', '.json'].includes(ext);
  
  if (isBinary) {
    const buf = fs.readFileSync(f.fullPath);
    assets[f.relPath] = {
      contentType,
      isBase64: true,
      content: buf.toString('base64'),
    };
  } else {
    const text = fs.readFileSync(f.fullPath, 'utf8');
    assets[f.relPath] = {
      contentType,
      isBase64: false,
      content: text,
    };
  }
}

// Add root index route
if (assets['/index.html']) {
  assets['/'] = assets['/index.html'];
}

const tsContent = `// Auto-generated embedded static client assets for standalone .exe binary
export interface EmbeddedAsset {
  contentType: string;
  isBase64?: boolean;
  content: string;
}

export const EMBEDDED_CLIENT_ASSETS: Record<string, EmbeddedAsset> = ${JSON.stringify(assets, null, 2)};
`;

fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
console.log(`✓ Generated ${OUTPUT_FILE} with ${Object.keys(assets).length} embedded static assets.`);
