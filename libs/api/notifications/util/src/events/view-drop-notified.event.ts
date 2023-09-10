import { Notification } from '@properproperty/api/notifications/util';

export class ViewDropNotifiedEvent {
  constructor(
    public readonly notification: Notification,
  ) {}
}
