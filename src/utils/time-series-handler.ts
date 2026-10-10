import { TimeSeriesResponse } from "@/services/mmkv-redux/apis";

type AggregationType = 'max' | 'min' | 'avg' | 'sum' | 'count';

interface DataPoint {
  timestamp: string;
  value: number;
}

interface ConsolidatedDataPoint extends DataPoint {
  count: number;
}

interface InputData {
  data: TimeSeriesResponse;
}

export const timeSeriesMetrics = [
  "heartrate",
  "hrv_rmssd",
  "hrv_sdnn",
  "elevation_gain",
  "elevation_loss",
  "ascent",
  "descent",
  "calories_burned",
  "calories_intake",
  "steps",
  "floors_climbed",
  "distance",
  "distance_walking",
  "distance_cycling",
  "distance_running",
  "distance_wheelchair",
  "distance_swimming",
  "speed",
  "air_temperature",
  "spo2",
  "breathing_rate",
  "longitude",
  "latitude",
  "elevation",
  "duration_active",
  "swimming_lengths",
  "swimming_distance_per_stroke",
  "sleep_efficiency",
  "sleep_duration",
  "sleep_duration_deep",
  "sleep_duration_light",
  "sleep_duration_rem",
  "sleep_duration_awake",
  "bedtime_duration",
  "sleep_interruptions",
  "sleep_duration_nap",
  "sleep_score",
  "sleep_breathing_rate",
  "sleep_latency",
  "wakeup_latency",
  "cadence",
  "pace",
  "body_mass_index",
  "weight",
  "height",
  "vo2max",
  "body_temperature",
  "basal_body_temperature",
  "skin_temperature",
  "sleep_skin_temperature_deviation",
  "ecg_voltage",
  "ecg_rri",
  "body_fat",
  "blood_pressure_systolic",
  "blood_pressure_diastolic",
  "body_bone_mass",
  "glucose"
];

export interface OutputData {
  data: {
    metric: string;
    from_timestamp: string;
    to_timestamp: string;
    providers: string[];
    provider_sources: string[];
    data: ConsolidatedDataPoint[];
  };
}

export const consolidateTimeSeriesData = (
  data: InputData,
  aggregationType: AggregationType = 'max'
): OutputData => {
  const buckets = new Map<string, number[]>();
  
  data.data.data.forEach((point: DataPoint) => {
    const timestamp = new Date(point.timestamp);
    
    const minutes = timestamp.getMinutes();
    const seconds = timestamp.getSeconds();
    
    let roundedMinutes: number;
    if (minutes === 0 && seconds === 0) {
      roundedMinutes = 0;
    } else if (minutes <= 30) {
      roundedMinutes = 30;
    } else {
      roundedMinutes = 0;
      timestamp.setHours(timestamp.getHours() + 1);
    }
    
    timestamp.setMinutes(roundedMinutes, 0, 0);
    const bucketKey = timestamp.toISOString();
    
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, []);
    }
    buckets.get(bucketKey)!.push(point.value);
  });
  
  const aggregatedData: ConsolidatedDataPoint[] = Array.from(buckets.entries()).map(
    ([timestamp, values]: [string, number[]]): ConsolidatedDataPoint => {
      let aggregatedValue: number;
      
      switch(aggregationType) {
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'avg':
          aggregatedValue = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
          break;
        case 'sum':
          aggregatedValue = values.reduce((a, b) => a + b, 0);
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        default:
          aggregatedValue = Math.max(...values);
      }
      
      return {
        timestamp,
        value: aggregatedValue,
        count: values.length
      };
    }
  );
  
  aggregatedData.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  return {
    data: {
      ...data.data,
      data: aggregatedData
    }
  };
};
