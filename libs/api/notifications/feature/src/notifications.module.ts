import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationsService } from './notifications.service';
import { NotificationSagas } from './notifications.sagas';
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
    NotificationSagas,
    ...commandHandlers,
    ...eventHandlers
  ],
  exports: [NotificationsService]
})
export class NotificationsModule {}