import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { SearchListingsRequest, SearchListingsResponse } from '@properproperty/api/search/util';
import { 
  FindPlaceFromTextRequest,
  FindPlaceFromTextResponseData,
} from '@googlemaps/google-maps-services-js/dist/places/findplacefromtext';
import { PlaceDetailsResponseData, PlaceDetailsRequest } from '@googlemaps/google-maps-services-js/dist/places/details';

import { Client } from '@googlemaps/google-maps-services-js';
import { PlaceInputType } from '@googlemaps/google-maps-services-js/dist/common';
import { Listing } from '@properproperty/api/listings/util';
import  axios from 'axios';
import { AxiosResponse } from 'axios';
export class SearchRepository {
  async searchListings(req: SearchListingsRequest): Promise<SearchListingsResponse>{
    console.log(process.env);
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
      querySnapshot.forEach((doc: any) => {
        searchResults.listings.push(doc.data() as Listing);
      });
      return searchResults;
    }

    // If query is passed, get data from Google Maps API
    // and return the listings that match the data
    // const config = {
    //   method: 'get',
    //   url: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?`
    //         + `input=${req.query}`
    //         + `&inputtype=textquery`
    //         + `&fields=formatted_address,geometry`
    //         + `&key=${process.env['NX_GOOGLE_MAPS_KEY']}`,
    //   headers: {},
    // };
    // try {
    //   const testReq: AxiosResponse<FindPlaceFromTextResponse, any> = await axios<FindPlaceFromTextResponse>(config);
    //   console.log(testReq);
    //   console.log(testReq.data);
    //   return {listings: [], apiRes: testReq.data};
    // } catch (e) {
    //   console.log("one", e);
    // }
    // const axios = new Axios(config);
    console.log(req);
    const apiClient = new Client({});
    const apiKey = process.env['NX_GOOGLE_MAPS_KEY'] ?? 'oopsie whoopsie';
    const apiRequest: FindPlaceFromTextRequest = {
        params: {
          input: req.query,
          inputtype: PlaceInputType.textQuery,
          fields: [
            'formatted_address', 
            'geometry',
            'place_id'
          ],
          key: apiKey,
        }
    };
    let apiResponse: FindPlaceFromTextResponseData| undefined;
    try {
      apiResponse = (await apiClient.findPlaceFromText(apiRequest)).data;
      console.log(apiResponse);
      // return {listings: [], apiRes: apiResponse};
    } catch (e) {
      console.log("two", e);
    }

    if (apiResponse && apiResponse.candidates.length > 0 && apiResponse.candidates[0].place_id) {
      try {
        const detailsReq: PlaceDetailsRequest = {
          params: {
            place_id: apiResponse.candidates[0].place_id,
            fields: [
              'adr_address',
              'address_component',
              
            ],
            key: apiKey,
          }
        };
        const detailsRes: PlaceDetailsResponseData = (await apiClient.placeDetails(detailsReq)).data;
        return {listings: [], apiRes: detailsRes};
      } catch (e) {
        console.log("three", e);
      }
    }

    return {listings: []};
  }
}