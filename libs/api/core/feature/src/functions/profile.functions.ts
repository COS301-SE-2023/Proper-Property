import * as functions from 'firebase-functions';
import { GetUserProfileRequest, GetUserProfileResponse, UpdateUserProfileRequest, UpdateUserProfileResponse } from '@properproperty/api/profile/util';
import { CoreModule } from '../core.module';
import { ProfileService } from '@properproperty/api/profile/feature';
import { NestFactory } from '@nestjs/core';

export const getUserProfile = functions.region('europe-west1').https.onCall(
  async (
    request: GetUserProfileRequest
  ): Promise<GetUserProfileResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const profileService = appContext.get(ProfileService);
    return profileService
      .getUserProfile(request.userId);
  }
);

export const updateUserProfile = functions.region('europe-west1').https.onCall(
  async (
    request: UpdateUserProfileRequest
  ): Promise<UpdateUserProfileResponse> => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const profileService = appContext.get(ProfileService);
    return profileService
      .updateUserProfile(request.user);
  }
);

export const listingCreated = functions
  .region('europe-west1')
  .firestore
  .document('listings/{listingId}')
  .onCreate(
    async (snapshot, context) => {
      const appContext = await NestFactory.createApplicationContext(CoreModule)
      const profileService = appContext.get(ProfileService);
      return profileService
        .addListing(snapshot.data()['user_id'], context.params.listingId);
    }
  );