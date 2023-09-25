import { 
  IQueryHandler, 
  QueryHandler 
} from '@nestjs/cqrs';
import { 
  SearchListingsQuery, 
  SearchListingsResponse 
} from '@properproperty/api/search/util';
import { SearchRepository } from '@properproperty/api/search/data-access';

@QueryHandler(SearchListingsQuery)
export class SearchListingsHandler implements IQueryHandler<
  SearchListingsQuery, 
  SearchListingsResponse
> {
  constructor(private readonly repo: SearchRepository) {}

  async execute(
    query: SearchListingsQuery
  ): Promise<SearchListingsResponse> {
    return this.repo.searchListings(query.request);
  }
}
