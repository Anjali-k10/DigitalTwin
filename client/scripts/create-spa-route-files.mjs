import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const indexPath = join(distDir, 'index.html');

const routes = [
  'login',
  'signup',
  'onboarding',
  'dashboard',
  'health',
  'finance',
  'career',
  'goals',
  'intelligence',
  'ai-intelligence',
  'notifications',
  'settings',
  'copilot',
  'simulation',
  'daily-update',
  'document-upload',
];

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html was not found. Run this script after vite build.');
}

for (const route of routes) {
  const outputPath = join(distDir, route);
  mkdirSync(dirname(outputPath), { recursive: true });
  copyFileSync(indexPath, outputPath);
}
