import { StatusChange, areaScore } from './index';
import { characteristics } from './index';
import { StatusEnum } from '../enums/status.enum';

export interface Listing{
  listing_id?: string;
  user_id: string;
  address: string;
  district: string;
  price: number;
  pos_type: string;
  env_type: string;
  prop_type: string;
  furnish_type: string;
  orientation: string;
  floor_size: number;
  property_size: number;
  bath: number;
  bed: number;
  parking: number;
  features: string[];
  photos: string[];
  desc: string;
  let_sell: string;
  listingAreaType: string;
  heading: string;
  statusChanges?: StatusChange[];
  status: StatusEnum;
  listingDate: string;
  quality_rating: number;
  geometry: {
    lat: number,
    lng: number
  },
  pointsOfInterestIds: string[];
  characteristics: characteristics;
  areaScore: areaScore;
}