import { Listing } from '@properproperty/api/listings/util';

export interface GetFilteredListingsResponse{
  status: boolean;
  listings: Listing[];
  error?: string;
}