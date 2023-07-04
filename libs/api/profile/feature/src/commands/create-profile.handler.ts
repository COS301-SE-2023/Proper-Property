import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProfileCommand } from '@properproperty/api/profile/util';
// import { profile } from '@properproperty/api/profile/util';
@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler implements ICommandHandler<CreateProfileCommand> {
  async execute(command: CreateProfileCommand) {
    console.log("New user id: " + command.user.uid);
  }
}