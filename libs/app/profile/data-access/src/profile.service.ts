import { Injectable } from '@angular/core';
import { UpdateUserProfileRequest, UpdateUserProfileResponse, UserProfile } from '@properproperty/api/profile/util';
import { Firestore, doc, updateDoc, setDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { httpsCallable, Functions, HttpsCallableResult } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  currentUser: UserProfile | null = null;

  constructor(private firestore: Firestore, private readonly functions: Functions) {}

  setCurrentUser(user: UserProfile): void {
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  printCurrentUser() {
    return [this.currentUser?.email, this.currentUser?.firstName, this.currentUser?.lastName, this.currentUser?.userId]
  }

  async registerNewUser(user_profile: UserProfile, uid: string) {
    const userRef = doc(this.firestore, 'users', uid);
    await setDoc(userRef, user_profile);
    user_profile.userId = uid;
    this.setCurrentUser(user_profile);
  }

  async loginUser(uid : string){
    const userRef = doc(this.firestore, `users/${uid}`);
    await getDoc(userRef).then((doc) => {
      const user = doc.data() as UserProfile;
      user.userId = uid;
      this.setCurrentUser(user);
    });
  }

  async updateUserEmail(Email:string) {
    const userRef = doc(this.firestore, `users/${this.currentUser?.userId}`);
    await updateDoc(userRef, {email: Email});
  }

  async deleteUser(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await deleteDoc(userRef);
  }

  async getUser(uid: string) : Promise<UserProfile>{
    return new Promise<UserProfile>(async (resolve) => {
      const userRef = doc(this.firestore, `users/${uid}`);
      await getDoc(userRef).then((doc) => {
        resolve(doc.data() as UserProfile);
      });
    });
  }

  async updateUserProfile(uProfile: UserProfile) {
    const resp: HttpsCallableResult = await httpsCallable<
      UpdateUserProfileRequest,
      UpdateUserProfileResponse
    >(this.functions, 'updateUserProfile')({user: uProfile});
    console.log(resp);
  }
}

