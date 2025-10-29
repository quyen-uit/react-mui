import type { User, UserRole } from '@/types/auth';

export const hasRole = (user: User, roles: UserRole[]) => roles.includes(user.role);
export const isAdmin = (user?: User | null) => user?.role === 'admin';

