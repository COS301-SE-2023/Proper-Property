import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFilteredListingsQuery,GetFilteredListingsResponse } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@QueryHandler(GetFilteredListingsQuery)
export class GetFilteredListingsHandler implements IQueryHandler<
  GetFilteredListingsQuery,
  GetFilteredListingsResponse
> {
  constructor(private readonly listingsRepository: ListingsRepository) {}
  
  async execute(query: GetFilteredListingsQuery) {
    const repoResponse = await this.listingsRepository.getFilteredListings(query.req);
    return repoResponse;
  }
}