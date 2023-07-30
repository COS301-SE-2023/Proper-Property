import { Listing } from '@properproperty/api/listings/util';
import { FindPlaceFromTextResponse } from '@googlemaps/google-maps-services-js/dist/places/findplacefromtext';
export interface SearchListingsResponse {
  listings: Listing[];
  apiRes?: FindPlaceFromTextResponse;
}