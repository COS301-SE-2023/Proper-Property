import { Injectable } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs';
import { GetNearbyPlacesRequest, GetNearbyPlacesResponse, GetNearbyPlacesQuery } from '@properproperty/api/google-maps/util';


@Injectable()
export class GoogleMapsService {
  constructor(private readonly queryBus : QueryBus){}
  async getNearbyPlaces(req: GetNearbyPlacesRequest): Promise<GetNearbyPlacesResponse>{
    return this.queryBus.execute(new GetNearbyPlacesQuery(req));
  }
}