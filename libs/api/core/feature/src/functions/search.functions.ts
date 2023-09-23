import * as functions from 'firebase-functions';
import { NestFactory } from '@nestjs/core';

import { CoreModule } from '../core.module';
import { SearchListingsRequest, SearchListingsResponse } from '@properproperty/api/search/util';
import { SearchService } from '@properproperty/api/search/feature';

export const searchListings = functions.region('europe-west1').https.onCall(
  async(
    request: SearchListingsRequest
  ): Promise<SearchListingsResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const searchService = appContext.get(SearchService);
    return searchService.searchListings(request);
  }
);
