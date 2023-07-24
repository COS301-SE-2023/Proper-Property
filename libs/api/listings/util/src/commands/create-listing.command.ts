import { Listing } from '../interfaces'

export class CreateListingCommand {
  constructor(public readonly listing: Listing) {}
}