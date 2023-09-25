import { UserProfile } from '@properproperty/api/profile/util';
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { NotificationsDoc } from '@properproperty/api/notifications/util';

@Injectable()
export class ProfileRepository {
  async createProfile(profile: UserProfile) {
    await admin
      .firestore()
      .collection('users')
      .doc(profile.userId)
      .set(profile);
    const notifDoc: NotificationsDoc = {
      userId: profile.userId,
      notifications: []
    };
    await admin
      .firestore()
      .collection('notifications')
      .doc(profile.userId)
      .set(notifDoc);
  }

  async getUserProfile(userId: string) {
    const profile = await admin
      .firestore()
      .collection('users')
      .withConverter<UserProfile>({
        fromFirestore: (snapshot) => snapshot.data() as UserProfile,
        toFirestore: (profile: UserProfile) => profile
      })
      .doc(userId)
      .get();
    return { user: profile.data()};
  }

  async updateUserProfile(profile: UserProfile) {
    await admin
      .firestore()
      .collection('users')
      .doc(profile.userId)
      .set(profile, {merge: true});
  }
}
