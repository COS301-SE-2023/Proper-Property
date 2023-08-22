import { Crime } from '@properproperty/api/loc-info/util';

export interface Station{
  crimeStats: Crime[];
  stationName: string;
}