import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateListingCommand,
  CreateListingRequest,
  CreateListingResponse,
  GetListingsRequest,
  GetListingsResponse,
  GetListingsQuery,
} from '@properproperty/api/listings/util';

@Injectable()
export class ListingsService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  async getListings(req: GetListingsRequest): Promise<GetListingsResponse> {
    return this.queryBus.execute(new GetListingsQuery(req));
  }

  async createListing(
    req: CreateListingRequest
  ): Promise<CreateListingResponse> {
    return this.commandBus.execute(new CreateListingCommand(req.listing));
  }
}