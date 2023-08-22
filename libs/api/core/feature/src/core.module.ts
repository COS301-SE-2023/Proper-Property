import { Module } from '@nestjs/common';
import { ProfileModule } from '@properproperty/api/profile/feature';
import { ListingsModule } from '@properproperty/api/listings/feature';
import { LocInfoModule } from '@properproperty/api/loc-info/feature';
@Module({
  imports: [ProfileModule, ListingsModule, LocInfoModule],
})
export class CoreModule {}