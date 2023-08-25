import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs'
import { LocInfoService } from './locInfo.service';
import { UploadCrimeStatsHandler, UploadSaniStatsHandler } from './commands';
import { ApiLocInfoDataAccessModule, LocInfoRepository } from '@properproperty/api/loc-info/data-access';
const CommandHandlers = [UploadCrimeStatsHandler, UploadSaniStatsHandler];

@Module({
  imports: [
    CqrsModule, 
    ApiLocInfoDataAccessModule
  ],
  providers: [ 
    LocInfoService,
    // LocInfoRepository,
    ...CommandHandlers
  ],
  exports: [
    LocInfoService,
    // LocInfoRepository
  ]
})
export class LocInfoModule {}
