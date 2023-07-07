import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { UpdateUserProfileCommand, UpdateUserProfileResponse } from '@properproperty/api/profile/util';
import { ProfileModel } from '../models';
import { ProfileRepository } from '@properproperty/api/profile/data-access';
@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler 
implements ICommandHandler<
  UpdateUserProfileCommand, 
  UpdateUserProfileResponse
> {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(command: UpdateUserProfileCommand) {
    console.log(UpdateUserProfileHandler.name);
    console.log(command);
    const user = (await this.profileRepo.getUserProfile(command.user.userId)).user;
    if (!user) {
      return {success: false};
    }
    const profileModel = this.eventPublisher
      .mergeObjectContext(ProfileModel.createProfile(user));
    
    profileModel.updateUserProfile(command.user);
    profileModel.commit();

    return  {success: true};
  }
}