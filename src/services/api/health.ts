import { baseApi } from '@/services/baseApi';
import { HEALTH } from '@/constants/api';

export const healthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    check: builder.query<{ status: 'ok' }, void>({
      query: () => ({ url: HEALTH.CHECK }),
      providesTags: ['Health'],
    }),
  }),
});

export const { useCheckQuery } = healthApi;

