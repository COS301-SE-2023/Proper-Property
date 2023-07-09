import * as functions from 'firebase-functions';
import { GetListingsRequest, GetListingsResponse } from '@properproperty/api/listings/util';


export const getListings = functions.region('europe-west1').https.onCall(
  async(
    request: GetListingsRequest
  ): Promise<GetListingsResponse> => {
    return {listings: []};// placeholder
  }
);
  