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

function resolvePath(val) {
  let raw = clean(val);
  if (!path.isAbsolute(raw)) raw = path.join(BASE_ROOT, raw);
  return path.normalize(raw);
}

const resources = 'resources';

export const paths = {
  themes_path: resolvePath(`${resources}/assets/themes`),
  notes_path: resolvePath(`${resources}/assets/notes`),
  global_path: resolvePath(`${resources}/global`),
  voice_model_path: resolvePath(`${resources}/models`),
  db_path: resolvePath(`${resources}/databases`)
};

export default paths;