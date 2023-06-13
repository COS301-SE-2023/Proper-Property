import { Injectable } from '@angular/core';
import { listing } from 'src/app/listing/interfaces/listing.interface';
import { Firestore, collection, collectionData, doc, docData, addDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { UserService } from '../user/user.service';
import { profile } from 'src/app/profile/interfaces/profile.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  currentUser: profile | null = null;

  constructor(private firestore: Firestore, public userServices: UserService) {
    this.currentUser = userServices.getCurrentUser();
  }

  async createListing(list : listing){
    const listingsRef = collection(this.firestore, 'listings');
    let listingRef = addDoc(listingsRef, list);
    console.log("Added to listings collection")
    await this.updateUserLisitings((await listingRef).id);
  }

  async updateUserLisitings(listing_id : string) {
    if(this.currentUser){
      const userRef = doc(this.firestore, `users/${this.currentUser.user_id}`);
      let user$ = docData(userRef) as Observable<profile>;
      let oldListings : string[] = [];

      user$.subscribe((user: profile) => {
          oldListings = user.listings;
        }
      );

      await updateDoc(userRef, {});
      oldListings.push(listing_id);
      await updateDoc(userRef, {listings: oldListings});
      console.log("Added to users listings array");
      return;
    }
    else{
      console.log("Error in listing services: currentUser is null")
      return;
    }
  }
}
