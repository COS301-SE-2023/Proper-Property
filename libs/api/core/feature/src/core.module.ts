import { Module } from '@nestjs/common';
import { ProfileModule } from '@properproperty/api/profile/feature';
import { ListingsModule } from '@properproperty/api/listings/feature';
import { NotificationsModule } from '@properproperty/api/notifications/feature';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
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