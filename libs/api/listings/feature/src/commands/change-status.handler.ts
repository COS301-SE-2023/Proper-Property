import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ChangeStatusCommand } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';
import { ListingModel } from '../models'; 
import { Listing } from '@properproperty/api/listings/util';
@CommandHandler(ChangeStatusCommand)
export class ChangeStatusHandler implements ICommandHandler<ChangeStatusCommand> {
  constructor(
    private readonly listingRepo : ListingsRepository,
    private readonly eventPublisher: EventPublisher
  ){}

  async execute(command: ChangeStatusCommand){
    const listing = (await this.listingRepo.getListing(command.req.listingId)).listings[0];

    const listingModel = this.eventPublisher.mergeObjectContext(ListingModel.createListing(listing));

    listingModel.approve(command.req.adminId);
  }
}