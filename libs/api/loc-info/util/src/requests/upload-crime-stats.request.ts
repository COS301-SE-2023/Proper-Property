import { Station } from '../interfaces'

export interface UploadCrimeStatsRequest {
  stationStats: Station[];
  quarter: string;
}