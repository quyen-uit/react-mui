import { baseApi } from '@/services/baseApi';
import { PRODUCTS } from '@/constants/api';
import type { Product } from '@/types/product';
import type { ApiListResponse, PaginationParams } from '@/types/api';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProducts: builder.query<ApiListResponse<Product>, PaginationParams | void>({
      query: (params) => ({
        url: PRODUCTS.LIST,
        params: params || { page: 1, perPage: 10 },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Products' as const, id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    getProduct: builder.query<Product, string | number>({
      query: (id) => ({ url: PRODUCTS.DETAIL(id) }),
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: PRODUCTS.CREATE, method: 'POST', body }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],

      // Optimistic update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newProduct } = await queryFulfilled;

          // Update the list cache
          dispatch(
            productsApi.util.updateQueryData(
              'listProducts',
              undefined,
              (draft) => {
                if (draft.data) {
                  draft.data.unshift(newProduct);
                  if (draft.meta) {
                    draft.meta.total += 1;
                  }
                }
              }
            )
          );
        } catch {
          // Error handling is done by the mutation
        }
      },
    }),

    updateProduct: builder.mutation<Product, Partial<Product> & { id: string | number }>({
      query: ({ id, ...body }) => ({
        url: PRODUCTS.UPDATE(id),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],

      // Optimistic update
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        // Update single product cache
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProduct', id, (draft) => {
            Object.assign(draft, patch);
          })
        );

        // Update list cache
        const listPatchResult = dispatch(
          productsApi.util.updateQueryData(
            'listProducts',
            undefined,
            (draft) => {
              if (draft.data) {
                const product = draft.data.find((p) => p.id === id);
                if (product) {
                  Object.assign(product, patch);
                }
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Undo optimistic updates on error
          patchResult.undo();
          listPatchResult.undo();
        }
      },
    }),

    deleteProduct: builder.mutation<{ success: boolean }, string | number>({
      query: (id) => ({ url: PRODUCTS.DELETE(id), method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],

      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productsApi.util.updateQueryData(
            'listProducts',
            undefined,
            (draft) => {
              if (draft.data) {
                draft.data = draft.data.filter((p) => p.id !== id);
                if (draft.meta) {
                  draft.meta.total -= 1;
                }
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
