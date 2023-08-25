import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadSaniStatsCommand } from '@properproperty/api/loc-info/util';
import { LocInfoRepository } from '@properproperty/api/loc-info/data-access';

@CommandHandler(UploadSaniStatsCommand)
export class UploadSaniStatsHandler implements ICommandHandler<UploadSaniStatsCommand> {
  constructor(
    private readonly locInfoRepo : LocInfoRepository
    ){}

  async execute(command: UploadSaniStatsCommand){
    // return {status:false};
    return this.locInfoRepo.uploadSaniStats(command.saniStats);
  }
}