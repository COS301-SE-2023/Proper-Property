import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveListingCommand } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@CommandHandler(SaveListingCommand)
export class SaveListingHandler implements ICommandHandler<SaveListingCommand> {
  constructor(private readonly listingRepo : ListingsRepository){}

  async execute(command: SaveListingCommand){
    return this.listingRepo.saveListing(command.listing);
  }
}