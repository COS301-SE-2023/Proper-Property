import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  UploadCrimeStatsRequest,
  UploadCrimeStatsResponse,
  UploadCrimeStatsCommand 
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
}
