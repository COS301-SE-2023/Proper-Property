import { NestFactory } from '@nestjs/core';
import { CoreModule } from '../core.module';
import * as functions from 'firebase-functions';
import { LocInfoService } from '@properproperty/api/loc-info/feature';
import { GetLocInfoDataResponse,
  GetLocInfoDataRequest,
  UploadLocInfoDataRequest,
  UploadLocInfoDataResponse} from '@properproperty/api/loc-info/util';

export const uploadLocInfoData = functions.region('europe-west1').https.onCall(
  async(
    request: UploadLocInfoDataRequest
  ): Promise<UploadLocInfoDataResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const locInfoService = appContext.get(LocInfoService);
    return locInfoService.uploadLocInfoData(request);
  }
);


export const getLocInfoData = functions.region('europe-west1').https.onCall(
  async(
    request: GetLocInfoDataRequest
  ): Promise<GetLocInfoDataResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const locInfoService = appContext.get(LocInfoService);
    return locInfoService.getLocInfoData(request);
  }
);