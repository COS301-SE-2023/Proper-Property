import { Listing } from '@properproperty/api/listings/util';

export class ListingEditedEvent {
  constructor(public readonly listing: Listing) {}
}