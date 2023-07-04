import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProfileCommand } from '@properproperty/api/profile/util';
// import { ProfileModel } from '../models';
import { profile } from '@properproperty/api/profile/util';
// import { profile } from '@properproperty/api/profile/util';
import { ProfileRepository } from '@properproperty/api/profile/data-access';
@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler implements ICommandHandler<CreateProfileCommand> {
  constructor(private readonly profileRepo: ProfileRepository) {}
  async execute(command: CreateProfileCommand) {
    console.log(CreateProfileHandler.name);
    const temp: profile = {
      userId: command.user.uid,
      email: command.user.email,
      listings: [],
    };
    this.profileRepo.createProfile(temp);
  }
}