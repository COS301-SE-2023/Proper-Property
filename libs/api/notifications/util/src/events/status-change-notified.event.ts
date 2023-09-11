import { Notification } from '@properproperty/api/notifications/util';

export class StatusChangeNotifiedEvent {
  constructor(
    public readonly notification: Notification,
  ) {}
}
