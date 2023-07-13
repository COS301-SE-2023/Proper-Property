import { UserProfile } from '@properproperty/api/profile/util';
export class SubscribeToUserProfile {
  static readonly type = '[UserProfile] SubscribeToUserProfile';
  constructor(public readonly userId?: string){}
}

export class UnsubscribeFromUserProfile {
  static readonly type = '[UserProfile] UnsubscribeFromUserProfile';
}

export class UpdateEmail {
  static readonly type = '[UserProfile] UpdateEmail';
  constructor(public readonly email: string){}
}

export class UpdateFirstName {
  static readonly type = '[UserProfile] UpdateFirstName';
  constructor(public readonly firstName: string){}
}

export class UpdateLastName {
  static readonly type = '[UserProfile] UpdateLastName';
  constructor(public readonly lastName: string){}
}

export class UpdateUserProfile {
  static readonly type = '[UserProfile] UpdateUserProfile';
  constructor(public readonly userProfile: Partial<UserProfile>){}
}