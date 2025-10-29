import {
  createApi,
  fetchBaseQuery,
  FetchArgs,
  BaseQueryFn,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
import { updateTokens, logout } from '@/app/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

let refreshing: Promise<string | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, unknown> = async (
  args,
  api,
  extraOptions,
) => {
  let result: any = await baseQuery(args, api, extraOptions);
  if (result?.error && (result.error as any).status === 401) {
    if (!refreshing) {
      refreshing = (async () => {
        const refreshResult: any = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions,
        );
        if (refreshResult?.data?.accessToken) {
          const newToken = refreshResult.data.accessToken as string;
          api.dispatch(updateTokens({ token: newToken }));
          return newToken;
        } else {
          api.dispatch(logout());
          return null;
        }
      })();
    }
    const newToken = await refreshing;
    refreshing = null;
    if (newToken) {
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Products', 'User', 'Health', 'Colors'],
  endpoints: () => ({}),
});

