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
  ApprovalChange
} from '@properproperty/api/listings/util';
// import { FieldValue, FieldPath } from 'firebase-admin/firestore';
// import { areaScore } from '@properproperty/api/listings/util';
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

  async changeStatus(listingId: string, change: ApprovalChange, req : ChangeStatusRequest): Promise<ChangeStatusResponse>{
    try {
      await admin
        .firestore()
        .collection('listings')
        .doc(listingId)
        .update({
          approved: change.status,
          approvalChanges: FieldValue.arrayUnion(change),
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
        approvalChange: change
      }
    }

    return {
      success: true,
      approvalChange: change
    };
  }

  async getApprovedListings(): Promise<GetApprovedListingsResponse>{
    const query = admin
    .firestore()
    .collection('listings').where("approved", "==", true);
    
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
}