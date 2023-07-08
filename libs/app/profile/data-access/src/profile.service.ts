import { Injectable } from '@angular/core';
import { profile } from '@properproperty/api/profile/util';
import { Firestore, doc, updateDoc, setDoc, getDoc, deleteDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  currentUser: profile | null = null;

  constructor(private firestore: Firestore) {}

  setCurrentUser(user: profile): void {
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  printCurrentUser() {
    return [this.currentUser?.email, this.currentUser?.firstName, this.currentUser?.lastName, this.currentUser?.userId]
  }

  async registerNewUser(user_profile: profile, uid: string) {
    const userRef = doc(this.firestore, 'users', uid);
    await setDoc(userRef, user_profile);
    user_profile.userId = uid;
    this.setCurrentUser(user_profile);
  }

  async loginUser(uid : string){
    const userRef = doc(this.firestore, `users/${uid}`);
    await getDoc(userRef).then((doc) => {
      const user = doc.data() as profile;
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

  async getUser(uid: string) : Promise<profile>{
    return new Promise<profile>(async (resolve) => {
      const userRef = doc(this.firestore, `users/${uid}`);
      await getDoc(userRef).then((doc) => {
        resolve(doc.data() as profile);
      });
    });
  }
}

