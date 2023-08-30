import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs'
import { LocInfoService } from './locInfo.service';
import { UploadLocInfoDataHandler } from './commands';
import { GetSaniDataHandler } from './queries';
import { ApiLocInfoDataAccessModule } from '@properproperty/api/loc-info/data-access';
const CommandHandlers = [UploadLocInfoDataHandler];
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
