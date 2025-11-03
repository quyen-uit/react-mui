import { FEATURES } from '@/config/features';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (!FEATURES.ENABLE_ANALYTICS) {
    return;
  }

  // Google Analytics
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, properties);
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.log('📊 Analytics Event:', eventName, properties);
  }
};

export const trackPageView = (path: string, title?: string) => {
  if (!FEATURES.ENABLE_ANALYTICS) {
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    });
  }

  if (import.meta.env.DEV) {
    console.log('📊 Page View:', path, title);
  }
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  trackEvent('error', {
    error_name: error.name,
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
};

export const trackUserAction = (action: string, details?: Record<string, any>) => {
  trackEvent('user_action', {
    action,
    ...details,
  });
};

// Common event trackers
export const analytics = {
  // Auth events
  login: (method: string) => trackEvent('login', { method }),
  logout: () => trackEvent('logout'),
  register: (method: string) => trackEvent('sign_up', { method }),

  // Page events
  pageView: trackPageView,

  // User actions
  productView: (productId: string) => trackEvent('view_product', { product_id: productId }),
  productCreate: (productId: string) => trackEvent('create_product', { product_id: productId }),
  productUpdate: (productId: string) => trackEvent('update_product', { product_id: productId }),
  productDelete: (productId: string) => trackEvent('delete_product', { product_id: productId }),

  // Error tracking
  error: trackError,

  // Custom events
  custom: trackEvent,
};
