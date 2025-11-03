export const FEATURES = {
  ENABLE_DARK_MODE: import.meta.env.VITE_FEATURE_DARK_MODE === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
  ENABLE_WEBSOCKETS: import.meta.env.VITE_FEATURE_WEBSOCKETS === 'true',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_FEATURE_NOTIFICATIONS !== 'false', // Default to true
  ENABLE_BETA_FEATURES: import.meta.env.VITE_FEATURE_BETA === 'true',
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FEATURES[feature];
};
