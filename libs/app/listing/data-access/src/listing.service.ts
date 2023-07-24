import { Injectable } from '@angular/core';
import { listing } from '@properproperty/app/listing/util';
import { Firestore, collection, doc, docData, addDoc, updateDoc, getDocs, getDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from "@angular/fire/storage";
import { UserService } from '@properproperty/app/user/data-access';
import { profile } from '@properproperty/app/profile/util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  currentUser: profile | null = null;

  constructor(private firestore: Firestore, public userServices: UserService, private storage : Storage) {
    this.currentUser = this.userServices.getCurrentUser();
  }

  onInit(){
    this.currentUser = this.userServices.getCurrentUser();
  }

  async createListing(list : listing){
    const listingsRef = collection(this.firestore, 'listings');
    const listingRef = addDoc(listingsRef, list);
    await this.uploadImages((await listingRef).id, list.photos);
    console.log("Added to listings collection")
    await this.updateUserLisitings((await listingRef).id);
  }

  async uploadImages(listingID : string, input: string[]) {
    const photoURLs : string[] = [];
    for(let i = 0; i < input.length; i++){
      const storageRef = ref(this.storage, "gs://demo-project.appspot.com/" + listingID + "/image" + i);
      await fetch("" + input[i]).then(res => res.blob())
      .then(async (blob : Blob) => {
        photoURLs.push(await getDownloadURL((await uploadBytes(storageRef, blob)).ref));
      })
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
    const listings$ = ((await getDocs(listingsRef)).docs.map(doc => doc.data()) as listing[]);
    const listings : listing[] = [];

    for(let i = 0; i < listings$.length; i++){
      const temp : listing = listings$[i];
      temp.listing_id = ((await getDocs(listingsRef)).docs[i].id);
      console.log(temp.listing_id);
      listings.push(temp);
    }
    return listings;
   
  }

  async getListing(listing_id : string){
    let listing : listing | null = null;
    const listingRef = doc(this.firestore, 'listings/' + listing_id);
    await getDoc(listingRef).then((doc) => {
      listing = doc.data() as listing;
    });

    return listing;
  }
}
