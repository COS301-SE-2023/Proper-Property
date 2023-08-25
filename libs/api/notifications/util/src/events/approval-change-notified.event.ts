import { Notification } from '@properproperty/api/notifications/util';

export class ApprovalChangeNotifiedEvent {
  constructor(
    public readonly notification: Notification
  ) {}
}
