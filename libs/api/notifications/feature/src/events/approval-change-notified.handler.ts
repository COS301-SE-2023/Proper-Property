import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ApprovalChangeNotifiedEvent } from '@properproperty/api/notifications/util';
import { NotificationsRepository } from '@properproperty/api/notifications/data-access';
@EventsHandler(ApprovalChangeNotifiedEvent)
export class ApprovalChangeNotifiedHandler
  implements IEventHandler<ApprovalChangeNotifiedEvent> {

    constructor(private readonly notifRepo: NotificationsRepository) {}

  handle(event: ApprovalChangeNotifiedEvent) {
    console.log('ApprovalChangeNotifiedHandler... event', event);

    this.notifRepo.updateNotifications(event.notification);
  }
}
