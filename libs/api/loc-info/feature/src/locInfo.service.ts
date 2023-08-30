import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  UploadCrimeStatsRequest,
  UploadCrimeStatsResponse,
  UploadCrimeStatsCommand,
  UploadSaniStatsRequest,
  UploadSaniStatsResponse,
  UploadSaniStatsCommand,
  UploadDistrictDataRequest,
  UploadDistrictDataResponse,
  UploadDistrictDataCommand,
  GetSaniDataRequest,
  GetSaniDataResponse,
  GetSaniDataQuery
} from '@properproperty/api/loc-info/util';

@Injectable()
export class LocInfoService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  async uploadCrimeStats(
    req: UploadCrimeStatsRequest
  ): Promise<UploadCrimeStatsResponse> {
    return this.commandBus.execute(new UploadCrimeStatsCommand(req));
    // return {status: false};
  }

  async uploadSaniStats(
    req: UploadSaniStatsRequest
  ): Promise<UploadSaniStatsResponse> {
    return this.commandBus.execute(new UploadSaniStatsCommand(req));
  }

  async uploadDistrictData(
    req: UploadDistrictDataRequest
  ): Promise<UploadDistrictDataResponse>{
    return this.commandBus.execute(new UploadDistrictDataCommand(req));
  }

  async getSaniData(
    req: GetSaniDataRequest
  ): Promise<GetSaniDataResponse>{
    return this.queryBus.execute(new GetSaniDataQuery(req));
  }
}
