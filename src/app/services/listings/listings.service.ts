import { Injectable } from '@angular/core';
import { listing } from 'src/app/listing/interfaces/listing.interface';
import { Firestore, collection, collectionData, doc, docData, addDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { UserService } from '../user/user.service';
import { profile } from 'src/app/profile/interfaces/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  currentUser: profile | null = null;

  constructor(private firestore: Firestore, public userServices: UserService) { }

  async createListing(list : listing){
    const listingsRef = collection(this.firestore, 'listings');
    let listingRef = addDoc(listingsRef, list);
    this.updateUserLisitings((await listingRef).id);
  }

  updateUserLisitings(listing_id : string) {
    if(this.currentUser){
      const userRef = doc(this.firestore, `users/${this.currentUser.user_id}`);
      let listings = docData(userRef, { idField: 'user_id' });
      console.log(listings);
      return updateDoc(userRef, { listings: listings});
    }

    return;
  }
}
