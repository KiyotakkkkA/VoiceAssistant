import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const assistantName = (process.env.ASSISTANT_NAME || '').replace(/^"|"$/g, '');
const configDir = (process.env.PATH_TO_YAML_CONFIGS_DIR || 'resources/configs')

export default defineConfig({
  root: '.',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  define: {
    __ASSISTANT_NAME__: JSON.stringify(assistantName),
    __SOCKET_HOST__: JSON.stringify(process.env.SOCKET_HOST || 'localhost'),
    __SOCKET_PORT__: JSON.stringify(process.env.SOCKET_PORT || 8765),
  }
});
