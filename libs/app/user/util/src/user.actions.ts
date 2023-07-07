export class SubscribeToUserProfile {
  static readonly type = '[User] SubscribeToUserProfile';
  constructor(public readonly userId?: string){}
}

export class UnsubscribeFromUserProfile {
  static readonly type = '[User] UnsubscribeFromUserProfile';
}