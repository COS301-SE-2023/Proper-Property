import { Injectable } from '@angular/core';
import { Listing, CreateListingRequest, CreateListingResponse, GetListingsRequest, GetListingsResponse, ChangeStatusResponse, ChangeStatusRequest, GetApprovedListingsResponse, EditListingRequest, EditListingResponse } from '@properproperty/api/listings/util';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { Storage, deleteObject, getDownloadURL, ref, uploadBytes } from "@angular/fire/storage";
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
      const storageRef = ref(this.storage, process.env['NX_FIREBASE_STORAGE_BUCKET'] + "/" + listingID + "/image" + i);
      await fetch("" + input[i]).then(res => res.blob())
      .then(async (blob : Blob) => {
        photoURLs.push(await getDownloadURL((await uploadBytes(storageRef, blob)).ref));
      })
    }

    // TODO Add this via CQRS
    const listingRef = doc(this.firestore, `listings/${listingID}`);
      await updateDoc(listingRef, {photos: photoURLs});
  }

  async getListings(){
    const response = (await httpsCallable<
      GetListingsRequest,
      GetListingsResponse
    >(
      this.functions, 
      'getListings'
    )({})).data;
    if (response.listings.length > 0){
      //sorted listings by quality score
      let tempListings:Listing[]=[];

      //sort response.listings array and put result into temp listings 

      tempListings = response.listings.sort((a,b) => ((a.quality_rating ?? 0) > (b.quality_rating ?? 0)) ? -1 : 1);
    
      
      return tempListings;
    }
    return [];
   
  }

  async getApprovedListings(){
    const response = (await httpsCallable<
      null,
      GetApprovedListingsResponse
    >(
      this.functions, 
      'getApprovedListings'
    )()).data;

    if(response.approvedListings.length > 0){
      return response.approvedListings;
    }

    return [];
  }

  async getListing(listing_id : string){
    const response: GetListingsResponse = (await httpsCallable<
      GetListingsRequest,
      GetListingsResponse
    >(
      this.functions, 
      'getListings'
    )({listingId: listing_id})).data;
    if (response.listings.length > 0){
      return response.listings[0];
    }
    return null;
  }

  async changeStatus(listingId : string, admin : string){
    const response: ChangeStatusResponse = (await httpsCallable<
      ChangeStatusRequest,
      ChangeStatusResponse
    >(
      this.functions,
      'changeStatus'
    )({listingId : listingId, adminId : admin})).data;

    return response;
  }

  async editListing(listing : Listing){
    const request : EditListingRequest = {listing: listing};
    const response: EditListingResponse = (await httpsCallable<
      EditListingRequest,
      EditListingResponse
    >(
      this.functions,
      'editListing'
    )(request)).data;

    if(response.listingId != 'FAILURE'){
      this.updateImages(response.listingId, listing.photos);
      return true;
    }

    else {
      return false;
    }
  }

  async updateImages(listingId : string, images : string[]){
    const photoURLs : string[] = [];
    const storageRef = ref(this.storage, process.env['NX_FIREBASE_STORAGE_BUCKET'] + listingId);
    deleteObject(storageRef);

    for(let i = 0; i < images.length; i++){
      const storageRef = ref(this.storage, process.env['NX_FIREBASE_STORAGE_BUCKET'] + listingId + "/image" + i);
      await fetch("" + images[i]).then(res => res.blob())
      .then(async (blob : Blob) => {
        photoURLs.push(await getDownloadURL((await uploadBytes(storageRef, blob)).ref));
      })
    }

    // TODO Add this via CQRS
    const listingRef = doc(this.firestore, `listings/${listingId}`);
      await updateDoc(listingRef, {photos: photoURLs});
  }
}
