import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLocInfoDataQuery } from '@properproperty/api/loc-info/util';
import { LocInfoRepository } from '@properproperty/api/loc-info/data-access';

@QueryHandler(GetLocInfoDataQuery)
export class GetLocInfoDataHandler implements IQueryHandler<GetLocInfoDataQuery> {
  constructor(private readonly locInfoRepo: LocInfoRepository) {}
  async execute(query: GetLocInfoDataQuery) {
    if(query.request.type == 'sanitation'){
      return this.locInfoRepo.getSaniData(query.request);
    }
    else if(query.request.type == 'water'){
      return this.locInfoRepo.getWaterScore(query.request);
    }
    else if(query.request.type == 'crime'){
      return this.locInfoRepo.getCrimeScore(query.request);
    }

    return {status: false, type: 'queryError', error: 'Invalid request type.'}
  }
}