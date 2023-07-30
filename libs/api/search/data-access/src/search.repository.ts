import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { SearchListingsRequest, SearchListingsResponse } from '@properproperty/api/search/util';

@Injectable()
export class SearchRepository {
  async searchListings(req: SearchListingsRequest): Promise<SearchListingsResponse>{
    const listings: any[] = [];
    const collection = admin.firestore().collection('listings');
    const query = collection.where('city', '==', req.city).limit(10);
    (await query.get()).forEach((doc) => {
      listings.push(doc.data());
    });
    return {listings: listings};
  }
}