import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { GetListingsRequest, Listing } from '@properproperty/api/listings/util';
import { UserProfile } from '@properproperty/api/profile/util';


@Injectable()
export class ListingsRepository {
  async getListings(req: GetListingsRequest){
    if(req.userId){
        let listingsIDs: string[] = 
        (await admin
        .firestore()
        .collection('users')
        .withConverter<UserProfile>({
          fromFirestore: (snapshot) => snapshot.data() as UserProfile,
          toFirestore: (profile: UserProfile) => profile
        })
        .doc(req.userId)
        .get())
        .data()
        ?.listings ?? [];

        let listings : Listing[] = [];
        for(let id in listingsIDs){
            await admin.firestore().collection('listings').where('listing_id', '==', listingsIDs[id]).get().then((snapshot) => {
        }

        return 
    }
    else{
        const listings = await admin.firestore().collection('listings').get();
        return listings.docs.map(listing => listing.data());
    }
  }
}