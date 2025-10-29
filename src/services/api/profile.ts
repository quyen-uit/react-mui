import { baseApi } from '@/services/baseApi';
import { PROFILE } from '@/constants/api';
import type { Profile } from '@/types/profile';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, void>({
      query: () => ({ url: PROFILE.GET }),
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<Profile, Partial<Profile>>({
      query: (body) => ({ url: PROFILE.UPDATE, method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>(
      {
        query: (body) => ({ url: PROFILE.PASSWORD, method: 'POST', body }),
      },
    ),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } =
  profileApi;

