import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUnapprovedListingsQuery,GetUnapprovedListingsResponse } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@QueryHandler(GetUnapprovedListingsQuery)
export class GetUnapprovedListingsHandler implements IQueryHandler<
  GetUnapprovedListingsQuery,
  GetUnapprovedListingsResponse
> {
  constructor(private readonly listingsRepository: ListingsRepository) {}
  
  async execute(query: GetUnapprovedListingsQuery) {
    return this.listingsRepository.getUnapprovedListings();
  }
}