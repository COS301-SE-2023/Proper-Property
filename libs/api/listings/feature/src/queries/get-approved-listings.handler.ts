import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetApprovedListingsQuery } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@QueryHandler(GetApprovedListingsQuery)
export class GetApprovedListingsHandler implements IQueryHandler<GetApprovedListingsQuery> {
  constructor(private readonly listingsRepository: ListingsRepository) {}
  async execute(query: GetApprovedListingsQuery) {
    console.log(query); // log for linter
    return this.listingsRepository.getApprovedListings();
  }
}