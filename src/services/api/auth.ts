import { baseApi } from '@/services/baseApi';
import { AUTH } from '@/constants/api';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '@/types/auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (body) => ({ url: AUTH.LOGIN, method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (body) => ({ url: AUTH.REGISTER, method: 'POST', body }),
    }),
    getCurrentUser: builder.query<{ user: User; accessToken: string | null }, void>({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ['Auth'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: AUTH.LOGOUT, method: 'POST' }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;

