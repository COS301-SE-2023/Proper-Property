import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetListingsQuery } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@QueryHandler(GetListingsQuery)
export class GetListingsHandler implements IQueryHandler<GetListingsQuery> {
  constructor(private readonly listingsRepository: ListingsRepository) {}
  async execute(query: GetListingsQuery) {
    const req = query.request;
    if (req.userId) {
      return this.listingsRepository.getListings(req);
    }
    if (req.listingId) {
      return this.listingsRepository.getListing(req.listingId);
    }
    return this.listingsRepository.getListings({});
  }
}