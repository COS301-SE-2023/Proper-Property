import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ViewDropNotifiedEvent } from '@properproperty/api/notifications/util';

@EventsHandler(ViewDropNotifiedEvent)
export class ViewDropNotifiedHandler
  implements IEventHandler<ViewDropNotifiedEvent> {
  handle(event: ViewDropNotifiedEvent) {
    console.log('ViewDropNotifiedHandler... event', event);
  }
}
