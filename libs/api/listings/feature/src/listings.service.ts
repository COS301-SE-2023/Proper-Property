import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateListingCommand,
  CreateListingRequest,
  CreateListingResponse,
  GetListingsRequest,
  GetListingsResponse,
  GetListingsQuery,
  ChangeStatusRequest,
  ChangeStatusResponse,
  ChangeStatusCommand,
  GetApprovedListingsResponse,
  GetApprovedListingsQuery,
  EditListingRequest,
  EditListingCommand,
  EditListingResponse,
  GetUnapprovedListingsResponse,
  GetUnapprovedListingsQuery,
  SaveListingCommand,
  GetFilteredListingsResponse,
  GetFilteredListingsRequest,
  GetFilteredListingsQuery
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

  async changeStatus(req: ChangeStatusRequest): Promise<ChangeStatusResponse>{
    return this.commandBus.execute(new ChangeStatusCommand(req));
  }
  async getApprovedListings(): Promise<GetApprovedListingsResponse>{
    return this.queryBus.execute(new GetApprovedListingsQuery());
  }

  async getUnapprovedListings(): Promise<GetUnapprovedListingsResponse>{
    return this.queryBus.execute(new GetUnapprovedListingsQuery());
  }

  async editListing(req: EditListingRequest): Promise<EditListingResponse>{
    return this.commandBus.execute(new EditListingCommand(req.listing))
  }

  async saveListing(req: CreateListingRequest): Promise<CreateListingResponse>{
    return this.commandBus.execute(new SaveListingCommand(req.listing));
  }

  async filterListings(req: GetFilteredListingsRequest): Promise<GetFilteredListingsResponse>{
    return this.queryBus.execute(new GetFilteredListingsQuery(req))
  }
}
