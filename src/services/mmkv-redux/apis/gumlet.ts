import { BACK_END } from '@env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '..';
import { PlaylistInfoResponse, PlaylistParam, VideoItem } from './interfaces';

export const gumletApi = createApi({
  reducerPath: 'gumletApi',
  tagTypes: ['Playlist', 'Video'],
  baseQuery: fetchBaseQuery({
    baseUrl: BACK_END,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;

      headers.set('Content-Type', 'application/json');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPlaylists: builder.query<PlaylistInfoResponse[], void>({
      query: () => '/gumlet/playlists',
      providesTags: ['Playlist'],
    }),

    getVideoData: builder.mutation<VideoItem[], string>({
      query: (playlistId) => ({
        url: `/gumlet/playlists/${playlistId}/videos`,
        method: 'GET',
      }),
      invalidatesTags: ['Video'],
    }),

    getPlaylistData: builder.query<VideoItem[], PlaylistParam>({
      query: (params) => ({
        url: `/gumlet/playlists/videos`,
        method: 'GET',
        params,
      }),
      providesTags: ['Video'],
    }),
  }),
});

export const {
  useGetPlaylistsQuery,
  useGetVideoDataMutation,
  useGetPlaylistDataQuery,
} = gumletApi;
