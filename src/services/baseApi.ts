import {
  createApi,
  fetchBaseQuery,
  FetchArgs,
  BaseQueryFn,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
import { updateTokens, logout } from '@/app/authSlice';
import type { ApiError } from '@/types/errors';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Add CSRF token for non-GET requests
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute('content');
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }

    return headers;
  },
});

interface RefreshResponse {
  accessToken: string;
}

let refreshing: Promise<string | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle network errors
  if (result.error && !('status' in result.error)) {
    return {
      error: {
        status: 0,
        data: { message: 'Network error. Please check your connection.' },
      } as ApiError,
    };
  }

  // Handle 401 Unauthorized - attempt token refresh
  if (result.error && 'status' in result.error && result.error.status === 401) {
    if (!refreshing) {
      refreshing = (async () => {
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (
          refreshResult.data &&
          typeof refreshResult.data === 'object' &&
          'accessToken' in refreshResult.data
        ) {
          const newToken = (refreshResult.data as RefreshResponse).accessToken;
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
      // Retry the original request with new token
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result as typeof result & { error?: ApiError };
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Products', 'User', 'Health', 'Colors'],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: 30,
  refetchOnReconnect: true,
  keepUnusedDataFor: 60,
});
