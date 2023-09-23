import { Listing } from '@properproperty/api/listings/util';
import { FindPlaceFromTextResponseData } from '@googlemaps/google-maps-services-js/dist/places/findplacefromtext';
import { PlaceDetailsResponseData } from '@googlemaps/google-maps-services-js/dist/places/details';
export interface SearchListingsResponse {
  listings: Listing[];
  apiRes?: FindPlaceFromTextResponseData | PlaceDetailsResponseData;
}