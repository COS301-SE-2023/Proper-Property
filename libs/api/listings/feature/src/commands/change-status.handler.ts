import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeStatusCommand } from '@properproperty/api/listings/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access';

@CommandHandler(ChangeStatusCommand)
export class ChangeStatusHandler implements ICommandHandler<ChangeStatusCommand> {
  constructor(private readonly listingRepo : ListingsRepository){}

  async execute(command: ChangeStatusCommand){
    return this.listingRepo.changeStatus(command.req);
  }
}