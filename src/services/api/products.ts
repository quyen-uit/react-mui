import { baseApi } from '@/services/baseApi';
import { PRODUCTS } from '@/constants/api';
import type { Product } from '@/types/product';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProducts: builder.query<Product[], void>({
      query: () => ({ url: PRODUCTS.LIST }),
      providesTags: ['Products'],
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: PRODUCTS.CREATE, method: 'POST', body }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation<Product, Partial<Product> & { id: string | number }>({
      query: ({ id, ...body }) => ({ url: PRODUCTS.UPDATE(id), method: 'PUT', body }),
      invalidatesTags: ['Products'],
    }),
    deleteProduct: builder.mutation<{ success: boolean; id: string | number }, string | number>({
      query: (id) => ({ url: PRODUCTS.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['Products'],
    }),
  }),
});

export const {
  useListProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;

