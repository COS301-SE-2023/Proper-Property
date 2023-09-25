import { Listing } from '@properproperty/api/listings/util';

export class ListingCreatedEvent {
  constructor(public readonly listing: Listing) {}
}