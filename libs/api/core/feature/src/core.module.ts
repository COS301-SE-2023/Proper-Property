import { Module } from '@nestjs/common';
import { ProfileModule } from '@properproperty/api/profile/feature';
import { ListingsModule } from '@properproperty/api/listings/feature';
import { NotificationsModule } from '@properproperty/api/notifications/feature';
// import * as fs from 'fs';
// import * as path from 'path';
@Module({
  imports: [
    ProfileModule, 
    ListingsModule, 
    NotificationsModule
  ],
})
export class CoreModule {}