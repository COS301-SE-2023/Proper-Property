import { NestFactory } from '@nestjs/core';
import { CoreModule } from '../core.module';
import * as functions from 'firebase-functions';
import { LocInfoService } from '@properproperty/api/loc-info/feature';
import { GetSaniDataResponse,
  GetSaniDataRequest,
  UploadLocInfoDataRequest,
  UploadLocInfoDataResponse} from '@properproperty/api/loc-info/util';


export const getCrimeRating = functions.region("europe-west1").https.onCall(
  async (district : string) => {
    console.log(district);
  }
);


export const uploadLocInfoData = functions.region('europe-west1').https.onCall(
  async(
    request: UploadLocInfoDataRequest
  ): Promise<UploadLocInfoDataResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const locInfoService = appContext.get(LocInfoService);
    console.log("Function call: ", request.request)
    return locInfoService.uploadLocInfoData(request);
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