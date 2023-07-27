import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
@Injectable()
export class NotificationsService {
  constructor() {}

  async sendNotification(token: string, notif:{title: string, body: string}) {
    admin.messaging().sendEach([
      {
        token: token,
        notification: notif
      }
    ])
  }
}