import { Module } from '@nestjs/common';
import { ProfileModule } from '@properproperty/api/profile/feature';
import { ListingsModule } from '@properproperty/api/listings/feature';
import { SearchModule } from '@properproperty/api/search/feature';
import { NotificationsModule } from '@properproperty/api/notifications/feature';
import { LocInfoModule } from '@properproperty/api/loc-info/feature';
import { GoogleMapsModule } from '@properproperty/api/google-maps/feature';
@Module({
  imports: [
    ProfileModule, 
    ListingsModule,
    SearchModule, 
    NotificationsModule,
    LocInfoModule,
    GoogleMapsModule
  ],
})
export class CoreModule {}