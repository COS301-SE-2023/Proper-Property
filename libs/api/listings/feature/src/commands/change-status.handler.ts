import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ChangeStatusCommand, ChangeStatusResponse } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';
import { ListingModel } from '../models'; 
@CommandHandler(ChangeStatusCommand)
export class ChangeStatusHandler 
implements ICommandHandler<
  ChangeStatusCommand,
  ChangeStatusResponse
> {
  constructor(
    private readonly listingRepo : ListingsRepository,
    private readonly eventPublisher: EventPublisher
  ){}

  async execute(command: ChangeStatusCommand): Promise<ChangeStatusResponse>{
    const listing = (await this.listingRepo.getListing(command.req.listingId)).listings[0];

    const listingModel = this.eventPublisher.mergeObjectContext(ListingModel.createListing(listing));
    let response;

    try {
      response = listingModel.changeStatus(command.req);
      listingModel.commit();
    } catch (error) {
      response = {success: false, statusChange: undefined}; 
    }
    
    return response;
  }
}