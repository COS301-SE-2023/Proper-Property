import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationsService } from './notifications.service';
import { NotificationSagas } from './notifications.sagas';
import { 
  NotifyApprovalChangeHandler,
  NotifyStatusChangeHandler,
  NotifyViewDropHandler,
  NotifyListingCreatedHandler,
  NotifyListingEditedHandler
} from './commands';
import { 
  ApprovalChangeNotifiedHandler,
  StatusChangeNotifiedHandler,
  ViewDropNotifiedHandler
} from './events';

const commandHandlers = [
  NotifyApprovalChangeHandler,
  NotifyStatusChangeHandler,
  NotifyViewDropHandler,
  NotifyListingCreatedHandler,
  NotifyListingEditedHandler
];
const eventHandlers = [
  ApprovalChangeNotifiedHandler,
  StatusChangeNotifiedHandler,
  ViewDropNotifiedHandler
];

import { NotificationsModule as NotificationsDataAccessModule } from '@properproperty/api/notifications/data-access';
import { ProfileModule as ProfileDataAccessModule } from '@properproperty/api/profile/data-access';
@Module({
  imports: [
    CqrsModule, 
    NotificationsDataAccessModule,
    ProfileDataAccessModule
  ],
  providers: [
    NotificationsService,
    NotificationSagas,
    ...commandHandlers,
    ...eventHandlers
  ],
  exports: [NotificationsService]
})
export class NotificationsModule {}