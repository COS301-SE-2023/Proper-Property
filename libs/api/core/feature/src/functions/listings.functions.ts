import * as functions from 'firebase-functions';
import { CreateListingRequest, CreateListingResponse, GetListingsRequest, GetListingsResponse } from '@properproperty/api/listings/util';
import { NestFactory } from '@nestjs/core';
import { CoreModule } from '../core.module';
import { ListingsService } from '@properproperty/api/listings/feature';


export const getListings = functions.region('europe-west1').https.onCall(
  async(
    request: GetListingsRequest
  ): Promise<GetListingsResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const listingService = appContext.get(ListingsService);
    return listingService.getListings(request);
  }
);

export const createListing = functions.region('europe-west1').https.onCall(
  async(
    request: CreateListingRequest
  ): Promise<CreateListingResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const listingService = appContext.get(ListingsService);

    return listingService.createListing(request);
  }
);
  