import { profile } from '@properproperty/api/profile/util';
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class ProfileRepository {
  async createProfile(profile: profile) {
    await admin
      .firestore()
      .collection('users')
      .doc(profile.userId)
      .set(profile);
  }

  async getUserProfile(userId: string) {
    const profile = await admin
      .firestore()
      .collection('users')
      .withConverter<profile>({
        fromFirestore: (snapshot) => snapshot.data() as profile,
        toFirestore: (profile: profile) => profile
      })
      .doc(userId)
      .get();
    return { user: profile.data()};
  }

  async updateUserProfile(profile: profile) {
    await admin
      .firestore()
      .collection('users')
      .doc(profile.userId)
      .set(profile, {merge: true});
  }
}
