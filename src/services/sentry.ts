import * as Sentry from '@sentry/react';

type InitOptions = {
  dsn?: string;
  environment?: string;
  enabled?: boolean;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
};

export function initSentry(opts: InitOptions = {}) {
  const enabled = opts.enabled ?? false;
  if (!enabled) return;
  Sentry.init({
    dsn: opts.dsn,
    environment: opts.environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: opts.tracesSampleRate ?? 0.1,
    replaysSessionSampleRate: opts.replaysSessionSampleRate ?? 0.1,
    replaysOnErrorSampleRate: opts.replaysOnErrorSampleRate ?? 1.0,
    debug: import.meta.env.DEV,
  });
}

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const setUser = Sentry.setUser;
export const addBreadcrumb = Sentry.addBreadcrumb;

