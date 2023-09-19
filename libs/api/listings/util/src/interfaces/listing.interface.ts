import { StatusChange, areaScore } from './index';
import { StatusEnum } from '../enums/status.enum';

export interface Listing{
  listing_id?: string;
  user_id: string;
  address: string;
  district: string;
  price: string;
  pos_type: string;
  env_type: string;
  prop_type: string;
  furnish_type: string;
  orientation: string;
  floor_size: string;
  property_size: string;
  bath: string;
  bed: string;
  parking: string;
  features: string[];
  photos: string[];
  desc: string;
  let_sell: string;
  listingAreaType: string;
  heading: string;
  statusChanges?: StatusChange[];
  status: StatusEnum;
  listingDate: string;
  quality_rating?: number;
  areaScore: areaScore;
}