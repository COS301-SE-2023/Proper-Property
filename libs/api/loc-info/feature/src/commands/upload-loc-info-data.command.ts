import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LocInfoRepository } from '@properproperty/api/loc-info/data-access';
import { UploadSaniStatsRequest, UploadCrimeStatsRequest, UploadLocInfoDataCommand, UploadDistrictDataRequest, UploadWWQStatsRequest } from '@properproperty/api/loc-info/util';

@CommandHandler(UploadLocInfoDataCommand)
export class UploadLocInfoDataHandler implements ICommandHandler<UploadLocInfoDataCommand> {
  constructor(private readonly locInfoRepo : LocInfoRepository){}

  async execute(command: UploadLocInfoDataCommand){
    if(command.req.path.includes('crime')){
      return this.locInfoRepo.uploadCrimeStats(command.req.request as UploadCrimeStatsRequest);
    }
    else if(command.req.path.includes('sani')){
      return this.locInfoRepo.uploadSaniStats(command.req.request as UploadSaniStatsRequest);
    }
    else if(command.req.path.includes('district')){
      return this.locInfoRepo.uploadDistrictData(command.req.request as UploadDistrictDataRequest);
    }
    else if(command.req.path.includes('wwq')){
      return this.locInfoRepo.uploadWWQStats(command.req.request as UploadWWQStatsRequest);
    }

    return {status : false};
  }
}