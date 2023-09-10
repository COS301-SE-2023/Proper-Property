import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { EditListingCommand, EditListingResponse } from '@properproperty/api/listings/util';
import { ListingModel } from '../models';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@CommandHandler(EditListingCommand)
export class EditListingHandler 
implements ICommandHandler<
  EditListingCommand, 
  EditListingResponse
> {
  constructor(
    private readonly listingRepo: ListingsRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(command: EditListingCommand) {
    console.log(EditListingHandler.name);
    console.log(command);

    if(!command.listing.listing_id){
      return {listingId: "FAILURE"};
    }

    const listing = (await this.listingRepo.getListing(command.listing.listing_id)).listings[0];

    if (!listing) {
      return  {listingId: "FAILURE"};
    }
    const model = this.eventPublisher.mergeObjectContext(ListingModel.createListing(listing));
    
    model.editListing(command.listing);
    model.commit();

    return  {listingId: command.listing.listing_id};
  }
}