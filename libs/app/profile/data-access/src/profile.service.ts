import { Injectable } from '@angular/core';
import { GetUserProfileRequest, GetUserProfileResponse, UpdateUserProfileRequest, UpdateUserProfileResponse, UserProfile } from '@properproperty/api/profile/util';
import { Firestore, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { httpsCallable, Functions, HttpsCallableResult } from '@angular/fire/functions';
import { Storage, deleteObject, getDownloadURL, ref, uploadBytes } from "@angular/fire/storage";

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  currentUser: UserProfile | null = null;

  constructor(private firestore: Firestore, private readonly functions: Functions, private storage: Storage) {}
  // TODO: Replace with state management
  getCurrentUser() {
    return this.currentUser;
  }

  printCurrentUser() {
    return [this.currentUser?.email, this.currentUser?.firstName, this.currentUser?.lastName, this.currentUser?.userId]
  }

  async deleteUser(uid: string) {
    console.log("Deleting doc")
    const userRef = doc(this.firestore, `users/${uid}`);
    const response = await deleteDoc(userRef);
    console.log(response);
  }

  async getUser(uid: string) : Promise<UserProfile>{
    const resp = (await httpsCallable<
      GetUserProfileRequest,
      GetUserProfileResponse
    >(
      this.functions, 
      'getUserProfile'
    )({userId: uid})).data;
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

  async uploadProfilePic(userID : string, input: string) {
    let photoURL : string = "";
    const storageRef = ref(this.storage, process.env['NX_FIREBASE_STORAGE_BUCKET'] + "/" + userID + "/profilePic");
    await fetch("" + input).then(res => res.blob())
    .then(async (blob : Blob) => {
      photoURL = await getDownloadURL((await uploadBytes(storageRef, blob)).ref);
    })

    console.log(photoURL)

    // TODO Add this via CQRS
    const userRef = doc(this.firestore, `users/${userID}`);
    await updateDoc(userRef, {profilePicture: photoURL});
    return photoURL;
  }
}

