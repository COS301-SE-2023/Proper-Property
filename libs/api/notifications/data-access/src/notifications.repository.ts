import { Injectable } from '@nestjs/common';
import { NotificationsDoc } from '@properproperty/api/notifications/util';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsRepository {
  constructor() {
    console.log('NotificationsRepository');
  }

  async getNotifications(userId: string): Promise<NotificationsDoc> {
    return (await admin
      .firestore()
      .collection('notifications')
      .withConverter<NotificationsDoc>({
        fromFirestore: (snapshot) => snapshot.data() as NotificationsDoc,
        toFirestore: (notifs: NotificationsDoc) => notifs
      })
      .doc(userId)
      .get())
      .data() as NotificationsDoc;
  }
}