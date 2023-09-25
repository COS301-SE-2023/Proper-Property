import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { StatusChangedEvent } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@EventsHandler(StatusChangedEvent)
export class StatusChangedHandler implements IEventHandler<StatusChangedEvent> {
  constructor(private readonly listingRepo: ListingsRepository) {}

  async handle(event: StatusChangedEvent) {
    await this.listingRepo.changeStatus(event.listingId, event.change, event.req);
  }
}