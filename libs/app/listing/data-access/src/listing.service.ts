import { Injectable } from '@angular/core';
import { Listing, CreateListingRequest, CreateListingResponse } from '@properproperty/api/listings/util';
import { Firestore, collection, doc, updateDoc, getDocs, getDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from "@angular/fire/storage";
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { Functions, httpsCallable } from '@angular/fire/functions';
@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  currentUser: UserProfile | null = null;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;

  constructor(
    private readonly firestore: Firestore, 
    private readonly userServices: UserProfileService, 
    private storage : Storage, 
    private readonly store: Store,
    private readonly functions: Functions
  ) {
    this.userProfile$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  async createListing(list : Listing){
    const request: CreateListingRequest = {listing: list};
    const response: CreateListingResponse = (await httpsCallable<
      CreateListingRequest,
      CreateListingResponse
    >(this.functions, 'createListing')(request)).data;

    console.warn(response);
    if (response.status) {
      this.uploadImages(response.message, list.photos);
    }
  }

  async uploadImages(listingID : string, input: string[]) {
    const photoURLs : string[] = [];
    for(let i = 0; i < input.length; i++){
      const storageRef = ref(this.storage, process.env['NX_FIREBASE_STORAGE_BUCKET'] + listingID + "/image" + i);
      await fetch("" + input[i]).then(res => res.blob())
      .then(async (blob : Blob) => {
        photoURLs.push(await getDownloadURL((await uploadBytes(storageRef, blob)).ref));
      })
    }

    const listingRef = doc(this.firestore, `listings/${listingID}`);
      await updateDoc(listingRef, {photos: photoURLs});
  }

  async getListings(){
    const listingsRef = collection(this.firestore, 'listings');
    const listings$ = ((await getDocs(listingsRef)).docs.map(doc => doc.data()) as Listing[]);
    const listings : Listing[] = [];

    for(let i = 0; i < listings$.length; i++){
      const temp : Listing = listings$[i];
      temp.listing_id = ((await getDocs(listingsRef)).docs[i].id);
      console.log(temp.listing_id);
      listings.push(temp);
    }
    return listings;
  }

  async getListing(listing_id : string){
    console.log(listing_id);
    let listing : Listing | null = null;
    const listingRef = doc(this.firestore, 'listings/' + listing_id);
    
    await getDoc(listingRef).then((doc) => {
      listing = doc.data() as Listing;
      console.log("redacted you " + listing);
    });

    return listing;
  }
}
