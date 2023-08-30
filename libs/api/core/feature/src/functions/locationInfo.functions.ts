import { NestFactory } from '@nestjs/core';
import { CoreModule } from '../core.module';
import * as functions from 'firebase-functions';
import { LocInfoService } from '@properproperty/api/loc-info/feature';
import { UploadCrimeStatsRequest,
  UploadCrimeStatsResponse,
  UploadDistrictDataResponse,
  UploadDistrictDataRequest,
  UploadSaniStatsRequest,
  UploadSaniStatsResponse, 
  GetSaniDataResponse,
  GetSaniDataRequest} from '@properproperty/api/loc-info/util';


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

export const uploadSaniStats = functions.region('europe-west1').https.onCall(
  async(
    request: UploadSaniStatsRequest
  ): Promise<UploadSaniStatsResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const locInfoService = appContext.get(LocInfoService);
    return locInfoService.uploadSaniStats(request);
  }
);

export const uploadDistrictData = functions.region('europe-west1').https.onCall(
  async(
    request: UploadDistrictDataRequest
  ): Promise<UploadDistrictDataResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const locInfoService = appContext.get(LocInfoService);
    return locInfoService.uploadDistrictData(request);
  }
);

export const getSaniData = functions.region('europe-west1').https.onCall(
  async(
    request: GetSaniDataRequest
  ): Promise<GetSaniDataResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const locInfoService = appContext.get(LocInfoService);
    return locInfoService.getSaniData(request);
  }
);