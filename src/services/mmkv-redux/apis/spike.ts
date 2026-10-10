import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BACK_END } from '@env';
import { TimeSeriesRequest, TimeSeriesResponse } from './interfaces';
import { RootState } from '..';

export const spikeApi = createApi({
  reducerPath: 'spikeApi',
  tagTypes: ['getConnectedProviders', 'getTimeSeriesData'],
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACK_END}`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      headers.set("Content-Type", "application/json");
    
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getConnectedProviders: builder.query({
      query: () => ({
        url: `/spikeapi/connected-providers`,
        method: 'GET',
      }),
      providesTags: ['getConnectedProviders'],
    }),
    getTimeSeriesData: builder.mutation<TimeSeriesResponse, TimeSeriesRequest>({
      query: (params) => ({
        url: `/spikeapi/timeseries`,
        method: 'GET',
        params,
      }),
      invalidatesTags: ['getTimeSeriesData'],
    }),
  }),
});

export const { 
    useGetConnectedProvidersQuery, 
    useLazyGetConnectedProvidersQuery,
    useGetTimeSeriesDataMutation,
} = spikeApi;
