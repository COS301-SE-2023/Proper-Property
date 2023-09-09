import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {  GetLocInfoDataRequest,
  GetLocInfoDataResponse,
  GetLocInfoDataQuery,
  UploadLocInfoDataCommand,
  UploadLocInfoDataRequest,
  UploadLocInfoDataResponse
} from '@properproperty/api/loc-info/util';

@Injectable()
export class LocInfoService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  async uploadLocInfoData(
    req: UploadLocInfoDataRequest
  ): Promise<UploadLocInfoDataResponse>{
    return this.commandBus.execute(new UploadLocInfoDataCommand(req));
  }

  async getLocInfoData(
    req: GetLocInfoDataRequest
  ): Promise<GetLocInfoDataResponse>{
    return this.queryBus.execute(new GetLocInfoDataQuery(req));
  }
}
