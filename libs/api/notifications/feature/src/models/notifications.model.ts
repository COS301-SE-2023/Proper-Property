import { AggregateRoot } from '@nestjs/cqrs';
import { 
  ApprovalChangeNotifiedEvent,
  StatusChangeNotifiedEvent,
  ViewDropNotifiedEvent,
  NotificationsDoc, 
  Notification 
} from '@properproperty/api/notifications/util';
export class NotificationsDocModel extends AggregateRoot implements NotificationsDoc {
  constructor(
    public userId: string,
    public notifications: Notification[]
  ) {
    super();
  }

  static createNotifications(notificationsDoc: NotificationsDoc) {
    const model = new NotificationsDocModel(
      notificationsDoc.userId,
      notificationsDoc.notifications,
    );
    return model;
  }
  sendNotification(notification: Notification) {
    this.notifications.push(notification);
    this.apply(new ApprovalChangeNotifiedEvent(notification));
  }

  sendStatusChangeNotification(notification: Notification) {
    this.notifications.push(notification);
    this.apply(new StatusChangeNotifiedEvent(notification));
  }

  sendViewDropNotification(notification: Notification) {
    this.notifications.push(notification);
    this.apply(new ViewDropNotifiedEvent(notification));
  }

  toJSON() {
    return {
      userId: this.userId,
      notifications: this.notifications,
    };
  }
}