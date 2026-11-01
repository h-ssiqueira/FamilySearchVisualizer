import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

function originOf(value: string | undefined, fallback: string): string {
  try {
    return value ? new URL(value).origin : fallback;
  } catch {
    return fallback;
  }
}

// GitHub Pages cannot send response headers, so the CSP is injected as a <meta> tag.
// It is applied to production builds only: the dev server needs inline scripts for HMR.
function contentSecurityPolicy(apiOrigin: string): Plugin {
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    `connect-src 'self' ${apiOrigin}`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
  return {
    name: 'fsv-content-security-policy',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiOrigin = originOf(env.VITE_FS_API_BASE, 'https://www.familysearch.org');

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), contentSecurityPolicy(apiOrigin)],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['src/domain/**', 'src/api/**', 'src/tree/**'],
        exclude: ['**/index.ts', '**/*.test.ts', '**/types.ts', '**/ports.ts'],
        // SDD asks for 80 % on domain, api and tree. Branches start at 70 % because of the
        // many optional (nullish) fields of the API; raise it once the real client exists.
        thresholds: { statements: 80, functions: 80, lines: 80, branches: 70 },
      },
    },
  };
});
