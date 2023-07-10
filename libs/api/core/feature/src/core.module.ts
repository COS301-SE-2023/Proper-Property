import { Module } from '@nestjs/common';
import { ProfileModule } from '@properproperty/api/profile/feature';
import { ListingsModule } from '@properproperty/api/listings/feature';
@Module({
  imports: [ProfileModule, ListingsModule],
})
export class CoreModule {}