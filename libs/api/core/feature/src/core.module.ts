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
    NotificationsModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: `smtps://${process.env['NX_SPAMBOT_PASSWORD']}:${process.env['NX_SPAMBOT_PASSWORD']}@smtp.google.com`,
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
})
export class CoreModule {}