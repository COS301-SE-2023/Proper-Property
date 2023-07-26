import { Listing } from "@properproperty/api/listings/util";

export class EditListingCommand {
  constructor(public readonly listing: Listing) {}
}