import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { StatusChangeNotifiedEvent } from '@properproperty/api/notifications/util';

@EventsHandler(StatusChangeNotifiedEvent)
export class StatusChangeNotifiedHandler
  implements IEventHandler<StatusChangeNotifiedEvent> {
  handle(event: StatusChangeNotifiedEvent) {
    console.log('StatusChangeNotifiedHandler... event', event);
  }
}
