import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadCrimeStatsCommand } from '@properproperty/api/loc-info/util';
import { LocInfoRepository } from '@properproperty/api/loc-info/data-access';

@CommandHandler(UploadCrimeStatsCommand)
export class UploadCrimeStatsHandler implements ICommandHandler<UploadCrimeStatsCommand> {
  constructor(
    private readonly locInfoRepo : LocInfoRepository
    ){}

  async execute(command: UploadCrimeStatsCommand){
    // return {status:false};
    return this.locInfoRepo.uploadCrimeStats(command.crimeStats);
  }
}