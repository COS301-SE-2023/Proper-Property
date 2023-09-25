import { ListingEditedEvent } from '@properproperty/api/listings/util';
export class NotifyListingEditedCommand {
  constructor(
    public readonly event: ListingEditedEvent
  ) {}
}