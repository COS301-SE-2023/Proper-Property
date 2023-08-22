import { NestFactory } from '@nestjs/core';
import { CoreModule } from '../core.module';
import * as functions from 'firebase-functions';
import { LocInfoService } from '@properproperty/api/loc-info/feature';
import { UploadCrimeStatsRequest, UploadCrimeStatsResponse } from '@properproperty/api/loc-info/util';


export const getCrimeRating = functions.region("europe-west1").https.onCall(
  async (district : string) => {
    console.log(district);
  }
);

export const uploadCrimeStats = functions.region('europe-west1').https.onCall(
  async(
    request: UploadCrimeStatsRequest
  ): Promise<UploadCrimeStatsResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const locInfoService = appContext.get(LocInfoService);
    // return {status: false};
    return locInfoService.uploadCrimeStats(request);
  }
);