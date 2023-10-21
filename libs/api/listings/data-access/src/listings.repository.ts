import * as admin from 'firebase-admin';
import { DocumentSnapshot, FieldValue } from 'firebase-admin/firestore';
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
  GetFilteredListingsResponse,
  RentSell
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
        return {
          status: false,
          message: error.message
        }
    });
  }

  async saveListing(listing : Listing){
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
      if (!req.crimeScore || !req.waterScore || !req.sanitationScore || !req.schoolScore) {
        await admin
          .firestore()
          .collection('listings')
          .doc(listingId)
          .update({
            statusChanges: FieldValue.arrayUnion(change),
            status: req.status
          });
      }
      else {
        await admin
          .firestore()
          .collection('listings')
          .doc(listingId)
          .update({
            statusChanges: FieldValue.arrayUnion(change),
            status: req.status,
            areaScore: {
              crimeScore: req.crimeScore ?? 0,
              waterScore: req.waterScore ?? 0,
              sanitationScore: req.sanitationScore ?? 0,
              schoolScore: req.schoolScore ?? 0
            }
          });
      }

    } catch(error: any) {
      return {
        success: false,
        statusChange: undefined,
        message: error.message
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
      const listingsCollection = admin.firestore().collection('listings');
      let query = listingsCollection
        .withConverter<Listing>({
          fromFirestore: (snapshot) => snapshot.data() as Listing,
          toFirestore: (listing: Listing) => listing
        })
        .where('status', '==', StatusEnum.ON_MARKET)
        .orderBy('quality_rating')

      let lastListingDoc: DocumentSnapshot | undefined = undefined;
      if (req.lastListingId) {
        lastListingDoc = (await listingsCollection
          .doc(req.lastListingId)
          .get());

        console.log(lastListingDoc.data);
      }

      if(req.prop_type){
        query = query.where("prop_type", "==", req.prop_type);
      }

      if(req.features){
        query = query.where("features", "array-contains-any", req.features);
      }
      if (req.let_sell && req.let_sell != RentSell.ANY) {
        query = query.where("let_sell", "==", req.let_sell);
      }
      if(req.env_type){
        query = query.where("env_type", "==", req.env_type);
      }
      const response: GetFilteredListingsResponse = {
        status: true,
        listings: []
      }
      
      if (lastListingDoc?.exists) {
        query = query.startAfter(lastListingDoc).limit(5);
      }
      let loopLimit = 0;
      // let lastListing: Listing | undefined = undefined;
      // let lastQualityRating = 0;
      let lastSnapshot: DocumentSnapshot | undefined = undefined 
      while (response.listings.length < 5 && loopLimit < 25) {
        const queryData = await query.get();
        ++loopLimit;
        // queryData.forEach((docSnapshot) => {
        for(const docSnapshot of queryData.docs){
          const data = docSnapshot.data();
          if (!data.geometry || !req.addressViewport) {
            continue;
          }
          if(data.geometry.lat > req.addressViewport.ne.lat || data.geometry.lat < req.addressViewport.sw.lat
          || data.geometry.lng > req.addressViewport.ne.lng || data.geometry.lng < req.addressViewport.sw.lng) {
            continue;
          }
          if (req.bath && data.bath < req.bath) {
            continue;
          }
          if (req.bed && data.bed < req.bed) {
            continue;
          }
          if (req.parking && data.parking < req.parking) {
            continue;
          }
          if ((req.price_min && data.price < req.price_min) ) {
            continue;
          }
          if ((req.price_max && data.price > req.price_max)) {
            continue;
          }
          if ((req.property_size_min && data.property_size < req.property_size_min ) ) {
            continue;
          }
          if ((req.property_size_max && data.property_size > req.property_size_max )) {
            continue;
          }
          if ((req.areaScore?.crimeScore && data.areaScore.crimeScore < req.areaScore.crimeScore)) {
            continue;
          }
          if ((req.areaScore?.waterScore && data.areaScore.waterScore < req.areaScore.waterScore)) {
            continue;
          }
          if ((req.areaScore?.schoolScore && data.areaScore.schoolScore < req.areaScore.schoolScore)) {
            continue;
          }
          if ((req.areaScore?.sanitationScore && data.areaScore.sanitationScore < req.areaScore.sanitationScore)) {
            continue;
          }
          if ((req.totalAreaScore && (data.areaScore.waterScore + data.areaScore.schoolScore + data.areaScore.crimeScore + data.areaScore.sanitationScore)/4 < req.totalAreaScore)) {
            continue;
          }
          console.log({
            lat: {
              min: req.addressViewport?.sw.lat,
              data: data.geometry.lat,
              max: req.addressViewport?.ne.lat
            },
            lng: {
              min: req.addressViewport?.sw.lng,
              data: data.geometry.lng,
              max: req.addressViewport?.ne.lng
            }
          });
          // for (const listing of response.listings) {
          //   if (listing.listing_id == data.listing_id) {
          //     console.log("what");
          //   }
          // }
          response.listings.push(data);
          if(response.listings.length >= 5){
            return response;
          }

          lastSnapshot = docSnapshot;
        }
        if (lastSnapshot)
          query = query.startAfter(lastSnapshot).limit(5 - response.listings.length);
      }
      console.log(response);
      return response;
    }
    catch(e: any){
      return {status: false, listings: [], error: e.message}
    }
  }
}