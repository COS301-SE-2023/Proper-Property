import * as functions from 'firebase-functions';
// import { CoreModule } from '../core.module';
// import { ProfileService } from '@properproperty/api/profile/feature';
// import { NestFactory } from '@nestjs/core';

export const getProfile = functions.region('europe-west1').https.onCall(
  async (
    request: string
  ): Promise<{message: string}> => {
  // return NestFactory.create(CoreModule).then(app => {
    return {message: request};
  // });
});