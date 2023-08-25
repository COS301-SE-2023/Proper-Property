import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Injectable } from '@nestjs/common';
import { GetListingsRequest,
  Listing,
  CreateListingResponse,
  GetListingsResponse, 
  ChangeStatusRequest, 
  ChangeStatusResponse, 
  GetApprovedListingsResponse,
  EditListingResponse,
  StatusChange
} from '@properproperty/api/listings/util';
// import { FieldValue, FieldPath } from 'firebase-admin/firestore';
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
    let collection = admin.firestore().collection('listings');
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
    let listingRef = admin
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

  async changeStatus(listingId: string, change : StatusChange){
    admin
      .firestore()
      .collection('listings')
      .doc(listingId)
      .update({
        'approved': true,
        'statusChanges': FieldValue.arrayUnion(change)
      });
    // console.log("Its show time");
    // const listingDoc = await admin
    // .firestore()
    // .doc(`listings/${req.listingId}`)
    // .withConverter<Listing>({
    //   fromFirestore: (snapshot) => snapshot.data() as Listing,
    //   toFirestore: (listing: Listing) => listing
    // }).get();

    // let tempStatusChanges = listingDoc.data()?.statusChanges ?? [];
    // tempStatusChanges
    //   .push({
    //     adminId : req.adminId, 
    //     status : !listingDoc.data()?.approved, 
    //     date : new Date().toISOString()
    //   });

    // admin
    //   .firestore()
    //   .doc(`listings/${req.listingId}`)
    //   .update({
    //     approved : !listingDoc.data()?.approved, 
    //     statusChanges : tempStatusChanges
    //   });
  }

  async getApprovedListings(): Promise<GetApprovedListingsResponse>{
    let query = admin
    .firestore()
    .collection('listings').where("approved", "==", true);
    
    let listings : Listing[] = [];
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
}