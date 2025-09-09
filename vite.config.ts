import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function loadProperties(filePath: string): Record<string, string> {
  const properties: Record<string, string> = {};
  if (!fs.existsSync(filePath)) {
    return properties;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          properties[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load properties file:', error);
  }
  
  return properties;
}

const propertiesPath = path.resolve(__dirname, 'init.properties');
const props = loadProperties(propertiesPath);

const assistantName = (props.ASSISTANT_NAME || '').replace(/^"|"$/g, '');

export default defineConfig({
  root: '.',
  base: './',
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
    __SOCKET_HOST__: JSON.stringify(props.SOCKET_HOST || 'localhost'),
    __SOCKET_PORT__: JSON.stringify(props.SOCKET_PORT || '8765'),
  }
});
