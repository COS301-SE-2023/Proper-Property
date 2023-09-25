import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { StatusChangeNotifiedEvent } from '@properproperty/api/notifications/util';

@EventsHandler(StatusChangeNotifiedEvent)
export class StatusChangeNotifiedHandler
  implements IEventHandler<StatusChangeNotifiedEvent> {
  handle(event: StatusChangeNotifiedEvent) {
    if (!event) console.log(event);
  }
}
