import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { CreateListingCommand } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';
import { ListingModel } from '../models/';
@CommandHandler(CreateListingCommand)
export class CreateListingHandler implements ICommandHandler<CreateListingCommand> {
  constructor(
    private readonly listingRepo : ListingsRepository,
    private readonly eventPublisher: EventPublisher
    ){}
  // I am sorry father for I have sinned
  async execute(command: CreateListingCommand){
    const response = await this.listingRepo.createListing(command.listing);
    if (!response.status) {
      throw new Error(response.message);
    }
    const listing = command.listing;
    listing.listing_id = response.message;
    const model = this.eventPublisher.mergeObjectContext(ListingModel.createListing(listing));
    model.notifyCreation();
    model.commit();
    return response;
  }
}