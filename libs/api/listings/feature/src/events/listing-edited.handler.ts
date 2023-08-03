import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ListingEditedEvent } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@EventsHandler(ListingEditedEvent)
export class ListingEditedHandler implements IEventHandler<ListingEditedEvent> {
  constructor(private readonly listingRepo: ListingsRepository) {}

  async handle(event: ListingEditedEvent) {
    console.log(ListingEditedHandler.name);
    await this.listingRepo.editListing(event.listing);
  }
}