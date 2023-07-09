import { UserProfile } from '@properproperty/api/profile/util';

export class UserProfileUpdatedEvent {
  constructor(public readonly user: UserProfile) {}
}