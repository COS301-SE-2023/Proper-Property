// eslint-disable-next-line
/// <reference types="@types/google.maps" />
import { StatusChange } from './index';

export interface Listing{
  listing_id?: string;
  user_id: string | undefined;
  address: string;
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
  heading: string;
  approved: boolean;
  statusChanges?: StatusChange[];
  listingDate: string;
  quality_rating?: number;
  geometry: {
    lat: number,
    lng: number
  },
  pointsOfInterest: google.maps.places.PlaceResult[];
}