import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationsService } from './notifications.service';
import { 
  NotifyApprovalChangeHandler,
  NotifyStatusChangeHandler,
  NotifyViewDropHandler
} from './commands';
import { 
  ApprovalChangeNotifiedHandler,
  StatusChangeNotifiedHandler,
  ViewDropNotifiedHandler
} from './events';

const commandHandlers = [
  NotifyApprovalChangeHandler,
  NotifyStatusChangeHandler,
  NotifyViewDropHandler
];
const eventHandlers = [
  ApprovalChangeNotifiedHandler,
  StatusChangeNotifiedHandler,
  ViewDropNotifiedHandler
];
@Module({
  imports: [CqrsModule],
  providers: [
    NotificationsService,
    ...commandHandlers,
    ...eventHandlers
  ],
  exports: [NotificationsService]
})
export class NotificationsModule {}