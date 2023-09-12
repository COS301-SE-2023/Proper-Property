import { Listing } from "@properproperty/api/listings/util";

export class SaveListingCommand {
  constructor(public readonly listing: Listing) {}
}