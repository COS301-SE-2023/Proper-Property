import { Module } from '@nestjs/common';
import { LocInfoRepository } from './locInfo.repository';
@Module({
  providers: [LocInfoRepository],
  exports: [LocInfoRepository]
})
export class ApiLocInfoDataAccessModule {};

