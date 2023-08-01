import * as functions from 'firebase-functions';
import { CoreModule } from '../core.module';
import { ProfileService } from '@properproperty/api/profile/feature';
import { NestFactory } from '@nestjs/core';
import { UserRecord } from 'firebase-admin/auth';
export const firestore = functions.region('europe-west1').auth.user().onCreate(async (user: UserRecord) => {
  //call createProfile of profile service
  return NestFactory.createApplicationContext(CoreModule).then(app => {
    return app.get(ProfileService).createProfile(user);
  })
});