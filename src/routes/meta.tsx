export type RouteMeta = {
  path: string;
  label: string;
  icon?: string;
  roles?: ('admin' | 'user')[];
};

export const NAV_ITEMS: RouteMeta[] = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard', roles: ['user', 'admin'] },
  { path: '/products', label: 'Products', roles: ['user', 'admin'] },
  { path: '/admin/users', label: 'Users', roles: ['admin'] },
];

