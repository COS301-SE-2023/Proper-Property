import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetApprovedListingsQuery } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@QueryHandler(GetApprovedListingsQuery)
export class GetApprovedListingsHandler implements IQueryHandler<GetApprovedListingsQuery> {
  constructor(private readonly listingsRepository: ListingsRepository) {}
  async execute(query: GetApprovedListingsQuery) {
    console.log(query); // 8:17  warning  'query' is defined but never used  @typescript-eslint/no-unused-vars what the **bad word**
    return this.listingsRepository.getApprovedListings();
  }
}