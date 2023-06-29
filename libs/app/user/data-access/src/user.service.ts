import { Injectable } from '@angular/core';
import { profile } from '@properproperty/app/profile/util';
import { Firestore, doc, docData, updateDoc, setDoc, FirestoreDataConverter, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: profile | null = null;

  constructor(private firestore: Firestore) {}

  setCurrentUser(user: profile): void {
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  printCurrentUser() {
    return [this.currentUser?.email, this.currentUser?.first_name, this.currentUser?.last_name, this.currentUser?.user_id]
  }

  async registerNewUser(user_profile: profile, uid: string) {
    const userRef = doc(this.firestore, 'users', uid);
    await setDoc(userRef, user_profile);
    user_profile.user_id = uid;
    this.setCurrentUser(user_profile);
  }

  async loginUser(uid : string){
    const userRef = doc(this.firestore, `users/${uid}`);
    await getDoc(userRef).then((doc) => {
      let user = doc.data() as profile;
      user.user_id = uid;
      this.setCurrentUser(user);
    });
  }

  async updateUserEmail(Email:string) {
    const userRef = doc(this.firestore, `users/${this.currentUser?.user_id}`);
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

