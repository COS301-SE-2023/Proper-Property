import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ApprovalChangeNotifiedEvent } from '@properproperty/api/notifications/util';

@EventsHandler(ApprovalChangeNotifiedEvent)
export class ApprovalChangeNotifiedHandler
  implements IEventHandler<ApprovalChangeNotifiedEvent> {
  handle(event: ApprovalChangeNotifiedEvent) {
    console.log('ApprovalChangeNotifiedHandler... event', event);
  }
}
