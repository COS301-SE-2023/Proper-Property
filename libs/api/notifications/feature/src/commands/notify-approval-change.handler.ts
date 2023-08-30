import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { NotifyApprovalChangeCommand } from '@properproperty/api/notifications/util';
import { Notification } from '@properproperty/api/notifications/util';
import { Timestamp } from '@firebase/firestore';
import { NotificationsDocModel } from '../models/notifications.model';
import { NotificationsDoc } from '@properproperty/api/notifications/util';
import { NotificationsRepository } from '@properproperty/api/notifications/data-access';
@CommandHandler(NotifyApprovalChangeCommand)
export class NotifyApprovalChangeHandler implements ICommandHandler<NotifyApprovalChangeCommand> {
  constructor(
    private readonly notifRepo: NotificationsRepository,
    private readonly eventPublisher: EventPublisher
  ){}
  async execute(command: NotifyApprovalChangeCommand) {
    console.log('---NotifyApprovalChangeCommand: ' + command.status);
    const notification: Notification = {
      userId: command.userId,
      listingId: command.listingId,
      head: command.status ? "Your listing has been approved" : "Your listing has been edited",
      body: command.status 
        ? "Your listing is now visible to other users and you will be able to review its engagement."
        : "Your listing has been edited and is awaiting reapproval.",
      type: "ApprovalChange",
      senderId: "system",
      date: Timestamp.fromDate(new Date())
    }

    const notificationsDoc: NotificationsDoc = await this.notifRepo.getNotifications(command.userId);
    const notifModel: NotificationsDocModel = this
      .eventPublisher
      .mergeObjectContext(
        NotificationsDocModel
        .createNotifications(notificationsDoc)
      );

    notifModel.sendApprovalChangeNotification(notification);
    notifModel.commit();
  }
}
