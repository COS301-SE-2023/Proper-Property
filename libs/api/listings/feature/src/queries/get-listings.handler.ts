import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetListingsQuery } from '@properproperty/api/listings/util';


@QueryHandler(GetListingsQuery)
export class GetListingsHandler implements IQueryHandler<GetListingsQuery> {
  async execute(query: GetListingsQuery) {
    console.log(query);
    return { listings: [] }; // placeholder
  }
}