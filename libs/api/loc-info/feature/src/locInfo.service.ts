import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {  GetSaniDataRequest,
  GetSaniDataResponse,
  GetSaniDataQuery,
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

  async getSaniData(
    req: GetSaniDataRequest
  ): Promise<GetSaniDataResponse>{
    return this.queryBus.execute(new GetSaniDataQuery(req));
  }
}
