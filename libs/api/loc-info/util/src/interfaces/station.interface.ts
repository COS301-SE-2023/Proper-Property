import { Crime } from '../interfaces';

export interface Station{
  crimeStats: Crime[];
  stationName: string;
  district: string;
  weightedTotal: number;
}