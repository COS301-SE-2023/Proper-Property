import { Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetListingsRequest, GetListingsResponse } from '@properproperty/api/listings/util';

@Injectable()
export class ListingsService {
  constructor(private readonly queryBus: QueryBus) {}

  async getListings(req: GetListingsRequest): GetListingsResponse{
    
  }
}