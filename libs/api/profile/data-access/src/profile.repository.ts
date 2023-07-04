import { profile } from '@properproperty/api/profile/util';
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class ProfileRepository {
  async createProfile(profile: profile) {
    await admin.firestore().collection('users').doc(profile.userId).set(profile);
  }
}
