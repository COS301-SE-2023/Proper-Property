import { NestFactory } from '@nestjs/core';
import { CoreModule } from '../core.module';
import * as functions from 'firebase-functions';
import { GetNearbyPlacesRequest, GetNearbyPlacesResponse } from '@properproperty/api/google-maps/util'
import { GoogleMapsService } from '@properproperty/api/google-maps/feature'

export const getNearbyPlaces = functions.region('europe-west1').https.onCall(
  async(
    request: GetNearbyPlacesRequest
  ): Promise<GetNearbyPlacesResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const googleMapsService = appContext.get(GoogleMapsService);
    return googleMapsService.getNearbyPlaces(request);
  }
);