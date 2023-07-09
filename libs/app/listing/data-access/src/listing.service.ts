import { Injectable } from '@angular/core';
import { Listing } from '@properproperty/app/listing/util';
import { Firestore, collection, doc, docData, addDoc, updateDoc, getDocs, getDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from "@angular/fire/storage";
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import { Observable } from 'rxjs';
import { UpdateUserProfile } from '@properproperty/app/profile/util';
import { Select, Store } from '@ngxs/store';
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
    private readonly store: Store
  ) {
    this.userProfile$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  async createListing(list : Listing){
    const listingsRef = collection(this.firestore, 'listings');
    const listingRef = await addDoc(listingsRef, list);
    console.warn(listingRef);
    await this.uploadImages(listingRef.id, list.photos);
    console.log("Added to listings collection")
    await this.updateUserLisitings(listingRef.id);
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
      // const oldListings: string[] = [];
      // const userRef = doc(this.firestore, `users/${this.currentUser.userId}`);
      console.log(listing_id);
      this.store.dispatch(new UpdateUserProfile({listings: [listing_id]}));
      // const listinGs = ((await getDoc(userRef)).data() as UserProfile).listings ?? [];
      // oldListings.push(...listinGs);
      // oldListings.push(listing_id);
      // await updateDoc(userRef, {listings: oldListings});
      // console.log("Added to users listings array");
      return;
    }
    else{
      console.log("Error in listing services: currentUser is null")
      return;
    }
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
    let listing : Listing | null = null;
    const listingRef = doc(this.firestore, 'listings/' + listing_id);
    await getDoc(listingRef).then((doc) => {
      listing = doc.data() as Listing;
    });

    return listing;
    // return null;
  }
}
