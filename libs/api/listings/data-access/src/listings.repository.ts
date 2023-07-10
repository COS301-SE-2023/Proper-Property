import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { GetListingsRequest, Listing, CreateListingResponse, GetListingsResponse } from '@properproperty/api/listings/util';
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
      query = collection.limit(5);
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
}