import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Injectable } from '@nestjs/common';
import { GetListingsRequest,
  Listing,
  CreateListingResponse,
  ChangeStatusRequest,
  ChangeStatusResponse,
  GetListingsResponse, 
  GetApprovedListingsResponse,
  EditListingResponse,
  StatusChange,
  GetUnapprovedListingsResponse,
  StatusEnum,
  GetFilteredListingsRequest,
  GetFilteredListingsResponse
} from '@properproperty/api/listings/util';
@Injectable()
export class ListingsRepository {

  async getListing(listingId: string): Promise<GetListingsResponse>{
    const doc = await admin
      .firestore()
      .collection('listings')
      .doc(listingId)
      .get();
    const data = doc.data();
    if(data){
      return {listings: [data as Listing]};
    }
    else{
      return {listings: []};
    }
  }

  async getListings(req: GetListingsRequest): Promise<GetListingsResponse>{
    const collection = admin.firestore().collection('listings');
    let query: admin.firestore.Query;

    if(req.userId){
      query = collection.where('user_id', '==', req.userId).limit(5);
    }
    else{
      query = collection.limit(10);
    }

    const listings: Listing [] = [];
    (await query.get()).forEach((doc) => {
      listings.push(doc.data() as Listing);
    });

    return {listings: listings};
  }

  async createListing(listing : Listing): Promise<CreateListingResponse>{
    // the guy she tells you not to worry about
    // return admin
    //   .firestore()
    //   .collection('listings')
    //   .withConverter<Listing>({
    //     fromFirestore: (snapshot) => snapshot.data() as Listing,
    //     toFirestore: (listing: Listing) => listing
    //   })
    //   // Won't work... unless?
    //   .add({
    //     listing_id: FieldPath.documentId().toString(),
    //     ...listing
    //   })
    //   .then((docRef) => {
    //     return {
    //       status: true,
    //       message: docRef.id
    //     };
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     return {
    //       status: false,
    //       message: error.message
    //     }
    //   });

    // you
    const listingRef = admin
      .firestore()
      .collection('listings')
      .withConverter<Listing>({
        fromFirestore: (snapshot) => snapshot.data() as Listing,
        toFirestore: (listing: Listing) => listing
      })
      .doc();
    
    listing.listing_id = listingRef.id;
    return listingRef.set(listing)
      .then(() => {
        return {
          status: true,
          message: listingRef.id
        };
      })
      .catch((error) => {
        console.log(error);
        return {
          status: false,
          message: error.message
        }
    });
  }

  async saveListing(listing : Listing){
    console.log(listing);
    if(listing.listing_id){
      await admin
      .firestore()
      .collection('listings')
      .doc(listing.listing_id)
      .set(listing);

      return {status: true, message: listing.listing_id};
    }
    
    return {status: false, message: "FAILURE"};
  }

  async changeStatus(listingId: string, change: StatusChange, req : ChangeStatusRequest): Promise<ChangeStatusResponse>{
    try {
      await admin
      .firestore()
      .collection('listings')
      .doc(listingId)
      .update({
        statusChanges: FieldValue.arrayUnion(change),
        status: req.status,
        areaScore: {
          crimeScore: req.crimeScore,
          waterScore: req.waterScore,
          sanitationScore: req.sanitationScore,
          schoolScore: req.schoolScore
        }
      });
    } catch(error) {
      console.log(error);
      return {
        success: true,
        statusChange: change
      }
    }

    return {
      success: true,
      statusChange: change
    };
  }

  async getApprovedListings(): Promise<GetApprovedListingsResponse>{
    const query = admin
    .firestore()
    .collection('listings').where("status", "==", StatusEnum.ON_MARKET);
    
    const listings : Listing[] = [];
    (await query.get()).docs.map((doc) => {
      doc.data() as Listing;
      listings.push(doc.data() as Listing);
    })

    return {approvedListings : listings};
  }

  async editListing(listing : Listing) : Promise<EditListingResponse>{
    if(listing.listing_id){
      await admin
      .firestore()
      .collection('listings')
      .doc(listing.listing_id)
      .set(listing, {merge: true});

      return {listingId : listing.listing_id};
    }

    return {listingId : "FAILIRE"}
  }

  async getUnapprovedListings(): Promise<GetUnapprovedListingsResponse>{
    const query = admin
    .firestore()
    .collection('listings')
    .where("status", "in", [StatusEnum.PENDING_APPROVAL, StatusEnum.EDITED]);
    
    const listings : Listing[] = [];
    (await query.get()).docs.forEach((doc) => {
      doc.data() as Listing;
      listings.push(doc.data() as Listing);
    })

    return {unapprovedListings : listings};
  }

  async getFilteredListings(req: GetFilteredListingsRequest): Promise<GetFilteredListingsResponse>{
    try{
      let query = admin
        .firestore()
        .collection('listings')
        .orderBy('quality_rating');

      if(req.property_size_max){
        query = query.where("floor_size", "<=", req.property_size_max);
      }

      if(req.property_size_min){
        query.where("floor_size", ">=", req.property_size_min);
      }

      if(req.let_sell){
        query.where("let_sell", "==", req.let_sell);
      }

      if(req.prop_type){
        query.where("prop_type", "==", req.prop_type);
      }

      if(req.bath){query = 
        query.where("bath", ">=", req.bath);
      }

      if(req.bed){
        query.where("bed", ">=", req.bed);
      }

      if(req.parking){
        query.where("parking", ">=", req.parking);
      }

      if(req.features){
        query.where("features", "in", req.features);
      }

      if(req.price_min){
        query.where("price", ">=", req.price_min);
      }

      if(req.price_max){
        query.where("price", "<=", req.price_max);
      }
      
      if (req.lastListingId) {
        const lastListingDoc = (await admin
          .firestore()
          .collection('listings')
          .doc(req.lastListingId)
          .get()).data() as Listing;

        query = query.startAfter(lastListingDoc);
      }
      query = query.limit(12);
      const listings : Listing[] = [];
      (await query.get()).docs.forEach((doc) => {
        doc.data() as Listing;
        listings.push(doc.data() as Listing);
      })

      return {status: true, listings: listings}
    }
    catch(e : any){
      return {status: false, listings: [], error: e.message}
    }
  }
}