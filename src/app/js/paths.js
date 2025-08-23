import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.normalize(path.join(__dirname, '..', '..', '..'));

let BASE_ROOT = APP_ROOT;
try {
  const { app } = await import('electron');
  if (app && app.isPackaged) {
    BASE_ROOT = process.resourcesPath;
  }
} catch {
}

try {
  const dotenvPath = path.join(APP_ROOT, '.env');
  if (fs.existsSync(dotenvPath)) {
    const dotenv = await import('dotenv');
    dotenv.config({ path: dotenvPath });
  }
} catch {}

function clean(v) {
  if (!v) return v;
  return v.trim().replace(/^['"]|['"]$/g, '');
}

function resolvePath(val, defaultRel) {
  const raw = clean(val);
  let p = raw ? raw : defaultRel;
  if (!path.isAbsolute(p)) p = path.join(BASE_ROOT, p);
  return path.normalize(p);
}

const resources = 'resources';

export const paths = {
  themes_path: resolvePath(process.env.PATH_TO_THEMES_CONFIGS_DIR, `${resources}/assets/themes`),
  global_path: resolvePath(process.env.PATH_TO_GLOBAL_DIR, `${resources}/global`)
};

export default paths;