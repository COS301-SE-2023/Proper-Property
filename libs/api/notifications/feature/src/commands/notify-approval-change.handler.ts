import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { NotifyApprovalChangeCommand, Notification } from '@properproperty/api/notifications/util';
import { Timestamp } from 'firebase-admin/firestore';
import { NotificationsDocModel } from '../models/notifications.model';
import { NotificationsRepository } from '@properproperty/api/notifications/data-access';
import  * as nodemailer  from 'nodemailer';
import { ProfileRepository } from '@properproperty/api/profile/data-access';
import { StatusEnum } from '@properproperty/api/listings/util';
@CommandHandler(NotifyApprovalChangeCommand)
export class NotifyApprovalChangeHandler implements ICommandHandler<NotifyApprovalChangeCommand> {
  constructor(
    private readonly notifRepo: NotificationsRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly profileRepo: ProfileRepository 
  ){}
  async execute(command: NotifyApprovalChangeCommand) {
    const profile = (await this.profileRepo.getUserProfile(command.event.userId)).user;
    if (!profile) {
      return;
    }
    if (!profile.email) {
      return;
    }
    const transporter = nodemailer.createTransport({
      secure: true,
      service: 'gmail',
      auth: {
        user: process.env['NX_SPAMBOT_ADDRESS'],
        pass: process.env['NX_SPAMBOT_APP_PASSWORD']
      }
    });
    
    const headBody = this.generateHeadAndBody(command.event.change.status, command.event.address);
    if(!headBody){
      return;
    }
    
    const notification: Notification = {
      userId: command.event.userId,
      listingId: command.event.listingId,
      head: headBody.head,
      body: headBody.body,
      type: "ApprovalChange",
      senderId: "system",
      date: Timestamp.fromDate(new Date())
    };

    const mailoptions = {
      from: process.env['NX_SPAMBOT_ADDRESS'],
      to: profile.email,
      subject: notification.head,
      text: notification.body
    };
    
    transporter.sendMail(mailoptions, (err, info) => {
      if (!info) console.log(info);
      if (err) {
        console.log(err);
      } 
    });

    const notificationsDoc = await this.notifRepo.getNotifications(command.event.userId);
    const notifModel: NotificationsDocModel = this
      .eventPublisher
      .mergeObjectContext(
        NotificationsDocModel
        .createNotifications(notificationsDoc)
      );

    notifModel.sendNotification(notification);
    notifModel.commit();
  }

  generateHeadAndBody(status: StatusEnum, address : string){    
    if(status == StatusEnum.ON_MARKET){
      return {
        head: "Your listing has been approved",
        body: "Your listing  at " + address + " is now visible to other users and you will be able to review its engagement. Please allow for a few minutes for us to calculate the listing's area score and gather nearby points of interest."
      }
    }
    
    if(status == StatusEnum.DENIED){
      return {
        head: "Your listing has been rejected",
        body: "Your listing  at " + address + " has been rejected and cannot be viewed by other users. This may have been" 
        + " due to inappropriate or inaccurate content or information being present in the listing. Please review the"
        + " listing and try again or contact us if you believe this was a mistake."
      }
    }

    return null;
  }
}
