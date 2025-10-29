export const AUTH = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
};

export const PRODUCTS = {
  LIST: '/products',
  CREATE: '/products',
  UPDATE: (id: string | number) => `/products/${id}`,
  DELETE: (id: string | number) => `/products/${id}`,
};

export const PROFILE = {
  GET: '/profile',
  UPDATE: '/profile',
  AVATAR: '/profile/avatar',
  PASSWORD: '/profile/password',
};

export const COLOR = {
  GET: (id: string | number) => `/colors/${id}`,
  SEARCH: '/colors/search',
  CREATE: '/colors',
  CREATE_MANY: '/colors/bulk',
  UPDATE: '/colors',
  DELETE: (id: string | number) => `/colors/${id}`,
};

export const HEALTH = { CHECK: '/health' };

