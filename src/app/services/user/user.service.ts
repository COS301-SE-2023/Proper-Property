import { Injectable } from '@angular/core';
import { profile } from '../../profile/interfaces/profile.interface';
import { Firestore, collection, collectionData, doc, docData, addDoc, deleteDoc, updateDoc, setDoc } from '@angular/fire/firestore';
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
    let user$ = docData(userRef) as Observable<profile>;

    user$.subscribe({
      next: (user: profile) => {
        user.user_id = uid;
        this.setCurrentUser(user);
      },
      error: (error) => {
        console.error('Error retrieving user data:', error);
      }
    });

    return;
  }
}

