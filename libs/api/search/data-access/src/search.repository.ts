import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { SearchListingsRequest, SearchListingsResponse } from '@properproperty/api/search/util';
import { 
  FindPlaceFromTextRequest,
  FindPlaceFromTextResponse,
} from '@googlemaps/google-maps-services-js/dist/places/findplacefromtext';
// Reading Google Documentation makes me want to kill myself :D
import { Client } from '@googlemaps/google-maps-services-js';
import { PlaceInputType } from '@googlemaps/google-maps-services-js/dist/common';
import { Listing } from '@properproperty/api/listings/util';
export class SearchRepository {
  async searchListings(req: SearchListingsRequest): Promise<SearchListingsResponse>{

    let searchResults: SearchListingsResponse = {
      listings: []
    };
    // Query that returns listings that are approved
    let query = admin.firestore().collection('listings').where('approved', '==', true);

    // Filters based on selected criteria
    if (req.listingType) {
      query = query.where('let_sell', '==', req.listingType);
    }
    if (req.propertyType) {
      query = query.where('prop_type', '==', req.propertyType);
    }
    if (req.minPrice) {
      query = query.where('price', '>=', req.minPrice);
    }
    if (req.maxPrice) {
      query = query.where('price', '<=', req.maxPrice);
    }
    if (req.bedrooms) {
      query = query.where('bed', '>=', req.bedrooms);
    }
    if (req.bathrooms) {
      query = query.where('bath', '>=', req.bathrooms);
    }
    if (req.parking) {
      query = query.where('parking', '>=', req.parking);
    }

    // If no query is passed, then return all valid listings
    if (!req.query) {
      let querySnapshot = await query.get();
      querySnapshot.forEach((doc) => {
        searchResults.listings.push(doc.data() as Listing);
      });
      return searchResults;
    }

    // If query is passed, get data from Google Maps API
    // and return the listings that match the data
    console.log(req);
    const apiClient = new Client({});
    const apiKey = process.env['NX_GOOGLE_MAPS_KEY'] ?? 'oopsie whoopsie someone made a fucky wucky';
    const apiRequest: FindPlaceFromTextRequest = {
        params: {
          input: req.query,
          inputtype: PlaceInputType.textQuery,
          fields: [
            'formatted_address', 
            'geometry',
            'adr_address',
          ],
          key: apiKey,
        }
    };
    const apiResponse = await apiClient.findPlaceFromText(apiRequest);
    console.log(apiResponse);
    return {listings: [], apiRes: apiResponse};
  }
}