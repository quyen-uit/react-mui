import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { CssBaseline, CssVarsProvider } from '@mui/material';
import './index.css';
import App from './App';
import { store } from '@/app/store';
import { initSentry } from '@/services/sentry';
import { theme } from '@/theme';

if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

initSentry({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
  enabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <CssVarsProvider storageKey="mui-color-scheme" theme={theme}>
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </Provider>
  </React.StrictMode>,
);
