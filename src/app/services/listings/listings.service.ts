import { Injectable } from '@angular/core';
import { listing } from 'src/app/listing/interfaces/listing.interface';
import { Firestore, collection, doc, docData, addDoc, updateDoc, getDocs } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from "@angular/fire/storage";
import { UserService } from '../user/user.service';
import { profile } from 'src/app/profile/interfaces/profile.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  currentUser: profile | null = null;

  constructor(private firestore: Firestore, public userServices: UserService, private storage : Storage) {
    this.currentUser = userServices.getCurrentUser();
  }

  async createListing(list : listing){
    const listingsRef = collection(this.firestore, 'listings');
    let listingRef = addDoc(listingsRef, list);
    await this.uploadImages((await listingRef).id, list.photos);
    console.log("Added to listings collection")
    await this.updateUserLisitings((await listingRef).id);
  }

  async uploadImages(listingID : string, input: any) {
    const photoURLs : string[] = [];
    for(var i = 0; i < input.length; i++){
      const storageRef = ref(this.storage, "gs://proper-property-51963.appspot.com/" + listingID + "/image" + i);
      await fetch("" + input[i]).then(res => res.blob())
      .then((blob : Blob) => {
        uploadBytes(storageRef, blob);
      })
    }

    for(var i = 0; i < input.length; i++){
      const storageRef = ref(this.storage, "gs://proper-property-51963.appspot.com/" + listingID + "/image" + i);
      photoURLs.push(await getDownloadURL(storageRef));
    }

    const listingRef = doc(this.firestore, `listings/${listingID}`);
    await updateDoc(listingRef, {photos: photoURLs});
  }

  async updateUserLisitings(listing_id : string) {
    if(this.currentUser){
      let oldListings : string[] = [];
      const userRef = doc(this.firestore, `users/${this.currentUser.user_id}`);
      (docData(userRef) as Observable<profile>).subscribe((user: profile) => {
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

  async getListings(){
    const listingsRef = collection(this.firestore, 'listings');
    let listings$ = (await getDocs(listingsRef)).docs.map(doc => doc.data()) as listing[];
    return listings$;
  }
}
