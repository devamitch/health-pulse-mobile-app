// import { allActivityAdditionalData, allActivityMetrics, allMetrics, allSleepMetrics, allStatisticsType, VitalTagKey, typedVitalTags as vitalTags } from "@/constants/spike";
// import Spike, { ActivityConfig, MetricType, Provider, SleepConfig, SpikeRNConnectionAPIv3, StatisticsFilter, StatisticsInterval } from 'react-native-spike-sdk';
// import CryptoJS from 'crypto-js';
// import { useState } from "react";
// import InAppBrowser from "react-native-inappbrowser-reborn";
// import { Platform } from "react-native";
// import { useAppDispatch, useAppSelector } from "@/services/mmkv-redux/hooks";
// import { SPIKE_API_HMAC_KEY } from "@env";
// import { addVitalToDB } from "@/services/sqlite/vitals";
// import { setAccessToken, setLastFetch, setRefreshToken } from "@/services/mmkv-redux/slices";
// import { useGetTimeSeriesDataMutation } from "@/services/mmkv-redux/apis/spike";
// import { consolidateTimeSeriesData, timeSeriesMetrics } from "@/utils/time-series-handler";
// import { useRefreshTokenMutation } from "@/services/mmkv-redux/apis/auth";

// const SPIKE_API_APPLICATION_ID = 10771

// const activityConfig = new ActivityConfig({
//     includeMetricTypes: allActivityMetrics,
//     includeAdditionalData: allActivityAdditionalData,
// });

// const sleepConfig = new SleepConfig({
//     includeMetricTypes: allSleepMetrics,
// });

// const useHealthConnect = () => {
//     const { userData, lastFetch, refreshToken } = useAppSelector(state => state.user);
//     const dispatch = useAppDispatch();

//     const [getTimeSeriesData] = useGetTimeSeriesDataMutation();
//     const [getNewToken] = useRefreshTokenMutation();

//     const email = userData?.email;
//     const uid = userData?.uid;

//     const [spikeConnection, setSpikeConnection] = useState<SpikeRNConnectionAPIv3>();

//     const connectProvider = async (provider: Provider) => {
//         try {
//             const connection = await getSpikeConnection();
            
//             if(!email)
//                 throw new Error("Userdata is undefined");
                
//             const response = await connection.getIntegrationInitUrl({
//                 provider,
//                 config: {
//                     redirectUri: 'HealthPulse://spike/callback',
//                     providerUserIdentifier: email
//                 }
//             });

//             const iab_response = await InAppBrowser.open(
//                 response,
//             );

//             console.log(iab_response);
            
//         } catch (error) {
//             console.error(error);
//             throw error;
//         }
//     }

//     const getSpikeConnection = async () => {
//         if(spikeConnection)
//             return spikeConnection;

//         if(!(uid))
//             throw new Error("Userdata is undefined");
            
//         const signature = CryptoJS.HmacSHA256(uid, SPIKE_API_HMAC_KEY).toString();
//         const connection = await Spike.createConnectionAPIv3({
//             applicationId: SPIKE_API_APPLICATION_ID, 
//             signature, 
//             endUserId: uid
//         });

//         setSpikeConnection(connection);
//         return connection;
//     }

//     const requestPermission = async () => {
//         const connection = await getSpikeConnection();

//         const response = await connection.requestHealthPermissions({
//             statisticTypes: allStatisticsType,
//             metricTypes: allMetrics,
//             activityConfigs: [activityConfig],
//             sleepConfigs: [sleepConfig],
//             includeBackgroundDelivery: true,
//             includeEnhancedPermissions: true,
//         });

//         return response;
//     }

//     const connectSamsumgHealth = async () => {
//         const connection = await getSpikeConnection();

//         const response = await connection.getSamsungHealthDataPermissions({
//             statisticTypes: allStatisticsType,
//             metricTypes: allMetrics,
//             activityConfigs: [activityConfig],
//             sleepConfigs: [sleepConfig],
//             includeBackgroundDelivery: true,
//             includeEnhancedPermissions: true,
//         })

//         return response;
//     }

//     const fetchRecords = async ({start, end}: {start?: Date | undefined, end?: Date | undefined}) => {
//         const connection = await getSpikeConnection();
//         const today = new Date();
        
//         const startDate = 
//             start ?? 
//             // (lastFetch ? new Date(lastFetch) : null) ?? 
//             new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

//         const endDate = end ?? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

//         const activitySummary = await connection.getRecords({
//             ofTypes: [MetricType.heartrate],
//             from: startDate,
//             to: endDate,
//             filter: new StatisticsFilter({
//                 providers: [Provider.oura]
//             })
//         });     

//         return activitySummary;
//     }

//     const fetchStatistics = async ({start, end}: {start?: Date | undefined, end?: Date | undefined}) => {
//         const connection = await getSpikeConnection();
//         const today = new Date();
        
//         const startDate = 
//             start ?? 
//             // (lastFetch ? new Date(lastFetch) : null) ?? 
//             new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

//         const endDate = end ?? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

//         console.log({connection, startDate: startDate.toISOString(), endDate: endDate.toISOString()});

//         const statSummary = await connection.getStatistics({
//             ofTypes: allStatisticsType,
//             from: startDate,
//             to: endDate,
//             interval: StatisticsInterval.hour,
//         });     

//         return statSummary;
//     }

//     const fetchTimeSeriesData = async ({start, end, metric}: {start?: Date | undefined, end?: Date | undefined, metric: string}) =>{
//         const today = new Date();
//         const startDate = 
//             start ?? 
//             // (lastFetch ? new Date(lastFetch) : null) ?? 
//             new Date(today.getFullYear(), today.getMonth() - 1, today.getDate() - 1);

//         const endDate = end ?? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

//         if(refreshToken){
//             const newToken = await getNewToken({token: refreshToken}).unwrap();
//             dispatch(setAccessToken(newToken.token));
//             dispatch(setRefreshToken(newToken.refreshToken));
//         }

//         const {data: timeSeriesSummary} = await getTimeSeriesData({
//             from_timestamp: startDate.toISOString(),
//             to_timestamp: endDate.toISOString(),
//             metric,
//         });

//         if(timeSeriesSummary){
//             return consolidateTimeSeriesData({data: timeSeriesSummary});
//         }

//         return timeSeriesSummary;
//     };

//     const backgroundFetch = async () => {
//         try {
//             const now = new Date();

//             if (lastFetch) {
//                 const lastFetchTime = new Date(lastFetch).getTime();
//                 const diff = now.getTime() - lastFetchTime;

//                 if (diff < 7200000) {
//                     return;
//                 }
//             }

//             const end = now;
//             const start = lastFetch
//                 ? new Date(lastFetch)
//                 : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

//             await Promise.all(
//                 timeSeriesMetrics.map(async (metric) => {
//                     const values = await fetchTimeSeriesData({
//                         start,
//                         end,
//                         metric,
//                     });

//                     if (values) {
//                         await Promise.all(
//                             values.data.data.map(async (item) => {
//                                 await addVitalToDB({
//                                     vital_type:
//                                         vitalTags[values.data.metric as VitalTagKey] ??
//                                         values.data.metric,
//                                     value: String(item.value ?? 0),
//                                     createdAt: item.timestamp,
//                                 });
//                             })
//                         );
//                     }
//                 })
//             );

//             dispatch(setLastFetch(now));
//         } catch (error) {
//             console.error(error);
//         }
//     }

//     return({
//         fetchTimeSeriesData,
//         fetchStatistics,
//         getSpikeConnection,
//         requestPermission,
//         fetchRecords,
//         connectProvider,
//         connectSamsumgHealth,
//         backgroundFetch,
//         isGoogleHealthConnectAvailable: async () => spikeConnection ? Platform.OS === 'android' : false,
//         isAppleHealthKitAvailable: async () => spikeConnection ? Platform.OS === 'ios' : false,
//         isSamsungHealthAvailable: async () => spikeConnection ? await spikeConnection.checkSamsungHealthDataAvailability() : false,
//     });
// }

// export default useHealthConnect;