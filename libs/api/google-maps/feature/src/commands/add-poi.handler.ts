import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddPOICommand } from '@properproperty/api/google-maps/util';
import { GoogleMapsRepository } from '@properproperty/api/google-maps/data-access';
import { StatusEnum } from '@properproperty/api/listings/util';
@CommandHandler(AddPOICommand)
export class AddPOIHandler implements ICommandHandler<AddPOICommand> {
  constructor(private readonly gmapsRepo : GoogleMapsRepository){}

  async execute(command: AddPOICommand){
    console.log(AddPOIHandler.name)
    if (command.event?.change.status == StatusEnum.ON_MARKET){
      return await this.gmapsRepo.addPOIs(command.event);
    }
    return {status: false, message: "Status not ON_MARKET"}
  }
}