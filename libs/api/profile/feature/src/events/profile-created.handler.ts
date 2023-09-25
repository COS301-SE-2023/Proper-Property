import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProfileCreatedEvent } from '@properproperty/api/profile/util';
import { ProfileRepository } from '@properproperty/api/profile/data-access';

@EventsHandler(ProfileCreatedEvent)
export class ProfileCreatedHandler implements IEventHandler<ProfileCreatedEvent> {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async handle(event: ProfileCreatedEvent) {
    await this.profileRepository.createProfile(event.profile);
  }
}
