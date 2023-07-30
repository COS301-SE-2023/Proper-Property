import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  SearchListingsRequest, 
  SearchListingsResponse, 
  SearchListingsQuery 
} from '@properproperty/api/search/util';

@Injectable()
export class SearchService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  searchListings(req: SearchListingsRequest): Promise<SearchListingsResponse> {
    return this.queryBus.execute(new SearchListingsQuery(req));
  }
}