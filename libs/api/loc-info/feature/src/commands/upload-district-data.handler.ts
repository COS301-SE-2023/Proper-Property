import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadDistrictDataCommand } from '@properproperty/api/loc-info/util';
import { LocInfoRepository } from '@properproperty/api/loc-info/data-access';

@CommandHandler(UploadDistrictDataCommand)
export class UploadDistrictDataHandler implements ICommandHandler<UploadDistrictDataCommand> {
  constructor(
    private readonly locInfoRepo : LocInfoRepository
    ){}

  async execute(command: UploadDistrictDataCommand){
    // return {status:false};
    return this.locInfoRepo.uploadDistrictData(command.districtData);
  }
}