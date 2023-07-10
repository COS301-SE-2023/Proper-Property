import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { GetListingsRequest, Listing, CreateListingResponse } from '@properproperty/api/listings/util';
// import { FieldValue, FieldPath } from 'firebase-admin/firestore';
@Injectable()
export class ListingsRepository {
  async getListings(req: GetListingsRequest){
    console.log(req);
    // TODO
    // if(req.userId){
    //     let listingsIDs: string[] = 
    //     (await admin
    //     .firestore()
    //     .collection('users')
    //     .withConverter<UserProfile>({
    //       fromFirestore: (snapshot) => snapshot.data() as UserProfile,
    //       toFirestore: (profile: UserProfile) => profile
    //     })
    //     .doc(req.userId)
    //     .get())
    //     .data()
    //     ?.listings ?? [];
    //     // 
    //     // let listings : Listing[] = [];
    //     // for(let id in listingsIDs){
    //     //     await admin.firestore().collection('listings').where('listing_id', '==', listingsIDs[id]).get().then((snapshot) => {
    //     // });
    //   // }
    // }
    // else{
    //   const listings = await admin.firestore().collection('listings').get();
    //   return listings.docs.map(listing => listing.data());
    // }
      return null;
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