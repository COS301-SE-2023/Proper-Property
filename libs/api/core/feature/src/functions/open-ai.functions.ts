import * as functions from 'firebase-functions';
import { GenerateListingDescriptionRequest, GenerateListingDescriptionResponse } from '@properproperty/api/listings/util';
import { NestFactory } from '@nestjs/core';
import { ListingsService } from '@properproperty/api/listings/feature';
import { CoreModule } from '../core.module';

export const generateListingDescription = functions.region('europe-west1').https.onCall(
  async (
    request: GenerateListingDescriptionRequest,
  ): Promise<GenerateListingDescriptionResponse> => {
    const app = await NestFactory.createApplicationContext(CoreModule);
    const listingService = app.get(ListingsService);
    return await listingService.generateListingDescription(request);
  }
);