import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.normalize(path.join(__dirname, '..', '..', '..'));

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
  if (!path.isAbsolute(p)) p = path.join(APP_ROOT, p);
  return path.normalize(p);
}

const resources = 'resources';

export const paths = {
  yaml_configs_path: resolvePath(process.env.PATH_TO_YAML_CONFIGS_DIR, `${resources}/configs`)
};

export default paths;