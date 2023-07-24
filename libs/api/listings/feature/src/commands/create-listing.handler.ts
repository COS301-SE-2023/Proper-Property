import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateListingCommand } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@CommandHandler(CreateListingCommand)
export class CreateListingHandler implements ICommandHandler<CreateListingCommand> {
  constructor(private readonly listingRepo : ListingsRepository){}

  async execute(command: CreateListingCommand){
    return this.listingRepo.createListing(command.listing);
  }
}