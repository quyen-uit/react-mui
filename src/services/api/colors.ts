import { baseApi } from '@/services/baseApi';
import { COLOR } from '@/constants/api';
import type { Color } from '@/types/color';

export const colorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getColor: builder.query<Color, string | number>({
      query: (id) => ({ url: COLOR.GET(id) }),
      providesTags: ['Colors'],
    }),
    searchColors: builder.query<Color[], { q: string }>({
      query: ({ q }) => ({ url: `${COLOR.SEARCH}?q=${encodeURIComponent(q)}` }),
      providesTags: ['Colors'],
    }),
    createColor: builder.mutation<Color, Partial<Color>>({
      query: (body) => ({ url: COLOR.CREATE, method: 'POST', body }),
      invalidatesTags: ['Colors'],
    }),
    createManyColors: builder.mutation<Color[], Partial<Color>[]>({
      query: (body) => ({ url: COLOR.CREATE_MANY, method: 'POST', body }),
      invalidatesTags: ['Colors'],
    }),
    updateColor: builder.mutation<Color, Partial<Color>>({
      query: (body) => ({ url: COLOR.UPDATE, method: 'PUT', body }),
      invalidatesTags: ['Colors'],
    }),
    deleteColor: builder.mutation<{ success: boolean; id: string | number }, string | number>({
      query: (id) => ({ url: COLOR.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['Colors'],
    }),
  }),
});

export const {
  useGetColorQuery,
  useSearchColorsQuery,
  useCreateColorMutation,
  useCreateManyColorsMutation,
  useUpdateColorMutation,
  useDeleteColorMutation,
} = colorsApi;

