import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { createHtmlPlugin } from 'vite-plugin-html';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'path';

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:*",
  "style-src 'self' 'unsafe-inline' https: data:",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' http://localhost:* ws://localhost:*",
  "frame-ancestors 'none'",
].join('; ');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const enableSentry = env.VITE_SENTRY_ENABLED === 'true';
  const appName = env.VITE_APP_NAME || 'React Shop';
  return {
    plugins: [
      react(),
      tsconfigPaths(),
      createHtmlPlugin({
        inject: {
          data: { title: appName },
        },
      }),
      enableSentry &&
        sentryVitePlugin({
          org: 'your-org',
          project: 'react-shop',
          telemetry: false,
        }),
    ].filter(Boolean) as any,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy':
          'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': cspDirectives,
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router': ['react-router-dom'],
            'redux': ['@reduxjs/toolkit', 'react-redux'],
            'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
            'mui-icons': ['@mui/icons-material'],
            'mui-pickers': ['@mui/x-date-pickers', '@mui/system'],
            'table': ['material-react-table'],
            'i18n': ['i18next', 'react-i18next'],
            'toast': ['react-toastify'],
            'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
        },
      },
    },
  };
});
