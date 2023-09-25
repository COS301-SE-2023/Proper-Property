import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserProfileUpdatedEvent } from '@properproperty/api/profile/util';
import { ProfileRepository } from '@properproperty/api/profile/data-access';

@EventsHandler(UserProfileUpdatedEvent)
export class UserProfileUpdatedHandler implements IEventHandler<UserProfileUpdatedEvent> {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async handle(event: UserProfileUpdatedEvent) {
    console.log(UserProfileUpdatedHandler.name);
    await this.profileRepository.updateUserProfile(event.user);
  }
}