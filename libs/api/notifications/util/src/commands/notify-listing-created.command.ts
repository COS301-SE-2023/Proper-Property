import { ListingEditedEvent, ListingCreatedEvent } from '@properproperty/api/listings/util';
export class NotifyListingCreatedCommand {
  constructor(
    public readonly event: ListingEditedEvent | ListingCreatedEvent // I have abandoned my sensibilities
  ) {}
}