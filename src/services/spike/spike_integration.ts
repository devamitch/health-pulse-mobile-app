// import Spike, { SpikeRNConnectionAPIv3, ActivityConfig, SleepConfig } from 'react-native-spike-sdk';
// import CryptoJS from 'crypto-js';
// import { allActivityAdditionalData, allActivityMetrics, allMetrics, allRecordMetrics, allSleepMetrics, allStatisticsType, vitalTags } from './constants';
// import { addVitalToDB } from '../sqlite/vitals';

// const applicationId = 10771
// const HMACKey = `8XSbl4dbyo6kAvyL5jeTHaXqTQY5UK0x`;
// const webhookSignatureKey = `A9E2QhcH7xT04JT375OdMZsD2V6pboBQ`;

// const activityConfig = new ActivityConfig({
//     includeAdditionalData: allActivityAdditionalData,
//     includeMetricTypes: allActivityMetrics,
// });

// const sleepConfig = new SleepConfig({
//     includeMetricTypes: allSleepMetrics,
// });

// export const initSpikeConnection = async (endUserId: string | undefined) : Promise<SpikeRNConnectionAPIv3> => {
//     if(endUserId === undefined)
//         throw new Error("EndUserID should be a string");
        
//     const signature = CryptoJS.HmacSHA256(endUserId, HMACKey).toString(CryptoJS.enc.Hex)
//     const uid = await Spike.createConnectionAPIv3({applicationId, signature, endUserId})
//     return uid
// }

// export const requestSpikePermission = async (connection: SpikeRNConnectionAPIv3) => {
//     const response = await connection.requestHealthPermissions({
//         statisticTypes: allStatisticsType,
//         metricTypes: allMetrics,
//         activityConfigs: [activityConfig],
//         sleepConfigs: [sleepConfig],
//         includeBackgroundDelivery: true,
//         includeEnhancedPermissions: true
//     });
//     return response
// }

// export const getSpikeRecordsToday = async (connection: SpikeRNConnectionAPIv3, lastFetch?: Date) => {
//     const today = new Date();
//     const startDate = lastFetch ?? new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
//     const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

//     const params = {
//         ofTypes: allRecordMetrics,
//         from: startDate,
//         to: endDate,
//     }

//     const statistics = await connection.getRecords(params);
    
//     return statistics;
// }

// export const getSpikeSummary = async (connection: SpikeRNConnectionAPIv3) => {
//     const today = new Date();
//     const startDate = new Date(today.getFullYear(), today.getMonth()-1, today.getDate() - 1);
//     const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

//     const activitySummary = await connection.getSleep({
//         from: startDate,
//         to: endDate,
//         config: sleepConfig,
//     });

//     return activitySummary;
// }

// export const backgroundFetch = async (uid: string, lastFetch?: Date) => {
//     try {
//         const connection = await initSpikeConnection(uid);
//         const records = await getSpikeRecordsToday(connection, lastFetch);
        
//         for (const record of records){
//             const metrics = record.metrics;
//             if(metrics){
//                 const keys = Object.keys(metrics);
//                 for (const key of keys) {
//                     await addVitalToDB({
//                         vital_type: vitalTags[key] ?? key,
//                         value: metrics[key].toString(),
//                         createdAt: new Date(record.startAt).toISOString(),
//                     });
//                 }
//             }
//         }
//     } catch (error) {
//         console.error(error);
//     }
// }
