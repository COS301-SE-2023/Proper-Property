
import { areaScore } from '@properproperty/api/listings/util';
// import { StatusEnum } from '../enums/status.enum';
export enum RentSell {
  LET = 'Rent',
  SELL = 'Sell',
  ANY = 'Any',
}
export interface GetFilteredListingsRequest {
  address?: string;
  addressViewport?: {
    ne: {
      lat: number;
      lng: number;
    };
    sw: {
      lat: number;
      lng: number;
    };
  };
  env_type?: string;
  prop_type?: string;
  bath?: number;
  bed?: number;
  parking?: number;
  features?: string[];
  property_size_min?: number;
  property_size_max?: number;
  price_min?: number;
  price_max?: number;
  areaScore?: Partial<areaScore>;
  totalAreaScore?: number;
  lastListingId?: string;
  let_sell: RentSell;
}