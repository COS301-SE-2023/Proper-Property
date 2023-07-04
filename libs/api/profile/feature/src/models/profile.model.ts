import { AggregateRoot } from '@nestjs/cqrs';
import { ProfileCreatedEvent, profile } from '@properproperty/api/profile/util';

export class ProfileModel extends AggregateRoot implements profile {
  constructor(
    public readonly userId: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly email?: string,
    public readonly listings?: string[],
  ) {
    super();
  }

  static createProfile(profile: profile) {
    const model = new ProfileModel(
      profile.userId,
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.listings,
    );
    model.apply(new ProfileCreatedEvent(profile));
    return model;
  }
}