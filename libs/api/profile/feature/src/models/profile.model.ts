import { AggregateRoot } from '@nestjs/cqrs';
import { Interests, UserProfileUpdatedEvent, UserProfile } from '@properproperty/api/profile/util';

export class ProfileModel extends AggregateRoot implements UserProfile {
  constructor(
    public userId: string,
    public interests: Interests,
    public firstName?: string,
    public lastName?: string,
    public email?: string,
    public listings?: string[],
  ) {
    super();
  }

  static createProfile(profile: UserProfile) {
    const model = new ProfileModel(
      profile.userId,
      profile.interests,
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.listings,
    );
    return model;
  }

  updateUserProfile(profile: UserProfile) {
    this.email = profile.email;
    this.firstName = profile.firstName;
    this.lastName = profile.lastName;
    this.listings = profile.listings;
    this.interests = profile.interests;

    this.apply(new UserProfileUpdatedEvent(profile));
  }

  toJSON(): UserProfile {
    return {
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      listings: this.listings,
      interests: this.interests
    };
  }
}