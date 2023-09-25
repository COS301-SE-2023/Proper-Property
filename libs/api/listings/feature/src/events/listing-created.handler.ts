import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ListingCreatedEvent } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@EventsHandler(ListingCreatedEvent)
export class ListingCreatedHandler implements IEventHandler<ListingCreatedEvent> {
  constructor(private readonly listingRepo: ListingsRepository) {}

  async handle(event: ListingCreatedEvent) {
    console.log(event);
  }
}