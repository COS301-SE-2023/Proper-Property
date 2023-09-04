export class SubscribeToNotificationsState {
  static readonly type = '[Notifications] SubscribeToNotificationsState';
  constructor(public readonly userId: string) {}
}

export class UnsubscribeFromNotificationsState {
  static readonly type = '[Notifications] UnsubscribeFromNotificationsState';
}