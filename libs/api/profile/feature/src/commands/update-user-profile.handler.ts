import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { UpdateUserProfileCommand, UpdateUserProfileResponse } from '@properproperty/api/profile/util';
import { UserProfileModel } from '../models';
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
    const user = (await this.profileRepo.getUserProfile(command.user.userId)).user;
    if (!user) {
      return {success: false};
    }
    const profileModel = this.eventPublisher
      .mergeObjectContext(UserProfileModel.createProfile(user));
    
    profileModel.updateUserProfile(command.user);
    profileModel.commit();

    return  {success: true};
  }
}