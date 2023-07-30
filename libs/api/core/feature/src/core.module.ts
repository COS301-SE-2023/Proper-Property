import { Module } from '@nestjs/common';
import { ProfileModule } from '@properproperty/api/profile/feature';
import { ListingsModule } from '@properproperty/api/listings/feature';
import { SearchModule } from '@properproperty/api/search/feature';
@Module({
  imports: [
    ProfileModule, 
    ListingsModule,
    SearchModule
  ],
})
export class CoreModule {}