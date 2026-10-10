import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BACK_END } from '@env';
import { CDNRequestProps, MediaData } from './interfaces';

export const fileApi = createApi({
  reducerPath: 'fileApi',
  tagTypes: ['getFiles'],
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACK_END}`,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getFiles: builder.query<MediaData[], CDNRequestProps | void>({
      query: (params) => ({
        url: `/stored-files${params?.id ? `/${params.id}` : ''}`,
        method: 'GET',
      }),
      providesTags: ['getFiles'],
    }),
  }),
});

export const { useGetFilesQuery, useLazyGetFilesQuery } = fileApi;
