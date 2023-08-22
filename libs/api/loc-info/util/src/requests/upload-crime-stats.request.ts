import { Station } from '@properproperty/api/loc-info/util'

export interface UploadCrimeStatsRequest {
  stationStats: Station[];
  quarter: string;
}