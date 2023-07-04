import { profile } from '@properproperty/api/profile/util';

export class ProfileCreatedEvent {
  constructor(public readonly profile: profile) {}
}