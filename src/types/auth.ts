export type UserRole = 'admin' | 'user' | 'guest';

export type User = {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
};

export type LoginCredentials = { email: string; password: string };
export type RegisterCredentials = { name: string; email: string; password: string };
export type AuthResponse = { user: User; accessToken: string | null };

