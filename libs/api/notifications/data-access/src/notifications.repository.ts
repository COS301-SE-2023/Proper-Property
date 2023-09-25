import { Injectable } from '@nestjs/common';
import { Notification, NotificationsDoc } from '@properproperty/api/notifications/util';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
@Injectable()
export class NotificationsRepository {
  constructor() {
    console.log('NotificationsRepository');
  }

  async getNotifications(userId: string) {
    console.log('getNotifications');
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

  async updateNotifications(notification: Notification) {
    console.log('updateNotifications');
    await admin
      .firestore()
      .collection('notifications')
      .doc(notification.userId)
      .update({
        'notifications': FieldValue.arrayUnion(notification)
      });
  }
}