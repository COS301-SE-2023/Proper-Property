import { Module } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';

@Module({
  providers: [NotificationsRepository],
  exports: [NotificationsRepository],
})
export class NotificationsModule {}