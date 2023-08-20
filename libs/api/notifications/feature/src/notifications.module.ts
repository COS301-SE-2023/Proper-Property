import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [CqrsModule],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}