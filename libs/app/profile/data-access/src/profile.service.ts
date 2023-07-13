import { Injectable } from '@angular/core';
import { GetUserProfileRequest, GetUserProfileResponse, UpdateUserProfileRequest, UpdateUserProfileResponse, UserProfile } from '@properproperty/api/profile/util';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';
import { httpsCallable, Functions, HttpsCallableResult } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  currentUser: UserProfile | null = null;

  constructor(private firestore: Firestore, private readonly functions: Functions) {}
  // TODO: Replace with state management
  getCurrentUser() {
    return this.currentUser;
  }

  printCurrentUser() {
    return [this.currentUser?.email, this.currentUser?.firstName, this.currentUser?.lastName, this.currentUser?.userId]
  }

  async deleteUser(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await deleteDoc(userRef);
  }

  async getUser(uid: string) : Promise<UserProfile>{
    const resp = (await httpsCallable<
      GetUserProfileRequest,
      GetUserProfileResponse
    >(
      this.functions, 
      'getUserProfile'
    )({userId: uid})).data as GetUserProfileResponse;
    console.log(resp);
    return resp.user as UserProfile;
  }

  async updateUserProfile(uProfile: UserProfile) {
    const resp: HttpsCallableResult = await httpsCallable<
      UpdateUserProfileRequest,
      UpdateUserProfileResponse
    >(this.functions, 'updateUserProfile')({user: uProfile});
    console.log(resp);
  }
}

