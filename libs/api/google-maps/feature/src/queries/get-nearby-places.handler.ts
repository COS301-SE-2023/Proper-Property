import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GoogleMapsRepository } from '@properproperty/api/google-maps/data-access';
import { GetNearbyPlacesQuery, GetNearbyPlacesResponse } from '@properproperty/api/google-maps/util';

@QueryHandler(GetNearbyPlacesQuery)
export class GetNearbyPlacesHandler implements IQueryHandler<
  GetNearbyPlacesQuery,
  GetNearbyPlacesResponse
> {
  constructor(private readonly gmapsRepo: GoogleMapsRepository) {}
  
  async execute(query: GetNearbyPlacesQuery) {
    return await this.gmapsRepo.getPointsOfInterest(query.req.listingId);
  }
}