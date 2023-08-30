import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs'
import { LocInfoService } from './locInfo.service';
import { UploadCrimeStatsHandler, UploadSaniStatsHandler, UploadDistrictDataHandler } from './commands';
import { GetSaniDataHandler } from './queries';
import { ApiLocInfoDataAccessModule, LocInfoRepository } from '@properproperty/api/loc-info/data-access';
const CommandHandlers = [UploadCrimeStatsHandler, UploadSaniStatsHandler, UploadDistrictDataHandler];
const QueryHandlers = [ GetSaniDataHandler ];

@Module({
  imports: [
    CqrsModule, 
    ApiLocInfoDataAccessModule
  ],
  providers: [ 
    LocInfoService,
    // LocInfoRepository,
    ...CommandHandlers,
    ...QueryHandlers
  ],
  exports: [
    LocInfoService,
    // LocInfoRepository
  ]
})
export class LocInfoModule {}
