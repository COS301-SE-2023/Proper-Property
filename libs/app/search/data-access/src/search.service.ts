import { Injectable } from "@angular/core";
import { Listing } from "@properproperty/api/listings/util";
import { SearchListingsRequest, SearchListingsResponse } from "@properproperty/api/search/util";
import { httpsCallable } from '@angular/fire/functions';
import { Functions } from "@angular/fire/functions";
@Injectable({
  providedIn: "root",
})
export class SearchService {
  constructor(private readonly functions: Functions) {}

  async search(req: SearchListingsRequest): Promise<Listing[]> {
    const response = await httpsCallable<
      SearchListingsRequest, 
      SearchListingsResponse
    >(
      this.functions,
      'searchListings'
    )(req);
    const responseData = response.data;
    return responseData.listings;
  }
}