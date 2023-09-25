import * as functions from 'firebase-functions';
import { NestFactory } from '@nestjs/core';
import { CoreModule } from '../core.module';
import { NotificationsService } from '@properproperty/api/notifications/feature';
import { SendQREmailRequest } from '@properproperty/api/notifications/util';
export const sendNotification = functions.region('europe-west1').https.onCall(
  async (
    request: SendQREmailRequest
  ) => {
    const appContext = await NestFactory.createApplicationContext(CoreModule)
    const notifServices = appContext.get(NotificationsService);
    return notifServices.sendQREmail(request);
  }
);