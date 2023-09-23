
import { areaScore } from '@properproperty/api/listings/util';
// import { StatusEnum } from '../enums/status.enum';

export interface GetFilteredListingsRequest {
  address?: string;
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
  lastListingId?: string;
}