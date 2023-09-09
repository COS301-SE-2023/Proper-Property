import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { NotifyApprovalChangeCommand } from '@properproperty/api/notifications/util';
import { Notification } from '@properproperty/api/notifications/util';
import { Timestamp } from 'firebase-admin/firestore';
import { NotificationsDocModel } from '../models/notifications.model';
// import { NotificationsDoc } from '@properproperty/api/notifications/util';
import { NotificationsRepository } from '@properproperty/api/notifications/data-access';
import  * as nodemailer  from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { ProfileRepository } from '@properproperty/api/profile/data-access';
@CommandHandler(NotifyApprovalChangeCommand)
export class NotifyApprovalChangeHandler implements ICommandHandler<NotifyApprovalChangeCommand> {
  constructor(
    private readonly notifRepo: NotificationsRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly profileRepo: ProfileRepository 
  ){}
  async execute(command: NotifyApprovalChangeCommand) {
    console.log('---NotifyApprovalChangeCommand: ' + command.status);
    const profile = (await this.profileRepo.getUserProfile(command.userId)).user;
    if (!profile) {
      console.log('---User profile not found');
      return;
    }
    if (!profile.email) {
      console.log('---User profile email not found');
      return;
    }
    const cred_path = path.join(__dirname, '..', '..', '..', 'victorias-secret-google-credentials', 'spambot-9000-inator.json');
    console.log(cred_path);
    
    const creds = JSON.parse(fs.readFileSync(cred_path, 'utf8'));
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: creds.auth.user,
        pass: creds.auth.pass
      }
    });
    
    const notification: Notification = {
      userId: command.userId,
      listingId: command.listingId,
      head: command.status ? "Your listing has been approved" : "Your listing has been rejected",
      body: command.status 
        ? "Your listing is now visible to other users and you will be able to review its engagement"
        : "The approval status on your listing has been reverted. This may have been due to recent editing of the listing",
      type: "ApprovalChange",
      senderId: "system",
      date: Timestamp.fromDate(new Date())
    };

    const mailoptions = {
      from: creds.user,
      to: profile.email,
      subject: notification.head,
      text: notification.body
    };
    
    transporter.sendMail(mailoptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    const notificationsDoc = await this.notifRepo.getNotifications(command.userId);
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
