import { Injectable } from '@angular/core';
import { profile } from '../../profile/interfaces/profile.interface';
import { Firestore, collection, collectionData, doc, docData, addDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';


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

  async registerNewUser(user_profile: profile) {
    const usersRef = collection(this.firestore, 'users');
    let userRef = addDoc(usersRef, user_profile);
    user_profile.user_id = (await userRef).id;
    this.setCurrentUser(user_profile);
  }
}

