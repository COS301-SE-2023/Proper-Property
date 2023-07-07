import { profile } from '@properproperty/api/profile/util';

export class UserProfileUpdatedEvent {
  constructor(public readonly user: profile) {}
}