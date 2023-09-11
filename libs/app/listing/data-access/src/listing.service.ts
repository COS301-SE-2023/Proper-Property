import { Injectable } from '@angular/core';
import { Listing,
  CreateListingRequest,
  CreateListingResponse,
  GetListingsRequest,
  GetListingsResponse,
  ChangeStatusResponse,
  ChangeStatusRequest,
  GetApprovedListingsResponse,
  EditListingRequest,
  EditListingResponse, 
  GetUnapprovedListingsResponse
} from '@properproperty/api/listings/util';
import { GetLocInfoDataRequest,
  GetLocInfoDataResponse } from '@properproperty/api/loc-info/util';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
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
      return response.listings;
    }
    return [];
   
  }

  async getApprovedListings(){
    const response = (await httpsCallable<
      undefined,
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

  async getUnapprovedListings(){
    const response = (await httpsCallable<
      undefined,
      GetUnapprovedListingsResponse
    >(
      this.functions,
      'getUnapprovedListings'
    )()).data;
  
    if(response.unapprovedListings.length > 0){
      return response.unapprovedListings;
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

  async changeStatus(listingId : string, admin : string, crimeScore: number, waterScore: number, sanitationScore: number, schoolScore: number){
    const response: ChangeStatusResponse = (await httpsCallable<
      ChangeStatusRequest,
      ChangeStatusResponse
    >(
      this.functions,
      'changeStatus'
    )(
      {
        listingId : listingId,
        adminId : admin, 
        crimeScore: crimeScore, 
        schoolScore: schoolScore, 
        waterScore: waterScore, 
        sanitationScore: sanitationScore
      })).data;

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
    console.log(storageRef.toString());

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

  async getSanitationScore(district : string){
    const response: GetLocInfoDataResponse = (await httpsCallable<
      GetLocInfoDataRequest,
      GetLocInfoDataResponse
    >(this.functions, 'getLocInfoData')({type: "sanitation", district: district})).data;

    console.log("Listing services", response);
    return response;
  }

  async getWaterScore(district : string, listingAreaType: string, listingType: string, coordinates: {lat: number, long: number}){
    const response: GetLocInfoDataResponse = (await httpsCallable<
      GetLocInfoDataRequest,
      GetLocInfoDataResponse
    >(this.functions, 'getLocInfoData')({type: "water", district: district, listingAreaType: listingAreaType, listingType: listingType, latlong: coordinates})).data;

    console.log("Listing services", response);
    return response;
  }

  async getCrimeScore(coordinates: {lat: number, long: number}){
    const response: GetLocInfoDataResponse = (await httpsCallable<
      GetLocInfoDataRequest,
      GetLocInfoDataResponse
    >(this.functions, 'getLocInfoData')({type: "crime", latlong: coordinates})).data;

    console.log("Listing services", response);
    return response;
  }
}
