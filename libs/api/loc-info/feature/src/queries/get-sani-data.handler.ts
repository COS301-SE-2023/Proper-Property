import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSaniDataQuery } from '@properproperty/api/loc-info/util';
import { LocInfoRepository } from '@properproperty/api/loc-info/data-access';

@QueryHandler(GetSaniDataQuery)
export class GetSaniDataHandler implements IQueryHandler<GetSaniDataQuery> {
  constructor(private readonly locInfoRepo: LocInfoRepository) {}
  async execute(query: GetSaniDataQuery) {
    return this.locInfoRepo.getSaniData(query.request);
  }
}