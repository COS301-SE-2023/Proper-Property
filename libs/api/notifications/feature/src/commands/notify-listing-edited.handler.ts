import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { NotifyListingEditedCommand, Notification } from '@properproperty/api/notifications/util';
import { Timestamp } from 'firebase-admin/firestore';
import { NotificationsDocModel } from '../models/notifications.model';
import { NotificationsRepository } from '@properproperty/api/notifications/data-access';
import  * as nodemailer  from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { ProfileRepository } from '@properproperty/api/profile/data-access';
import { StatusEnum } from '@properproperty/api/listings/util';
@CommandHandler(NotifyListingEditedCommand)
export class NotifyListingEditedHandler implements ICommandHandler<NotifyListingEditedCommand> {
  constructor(
    private readonly notifRepo: NotificationsRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly profileRepo: ProfileRepository 
  ){}
  async execute(command: NotifyListingEditedCommand) {
    console.log('---NotifyListingEditedCommand: ' + command.event.listing.status);
    const profile = (await this.profileRepo.getUserProfile(command.event.listing.user_id)).user;
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
      secure: true,
      service: 'gmail',
      auth: {
        user: creds.auth.user,
        pass: creds.auth.pass
      }
    });
    
    const headBody = this.generateHeadAndBody(command.event.listing.status, command.event.listing.address);
    if(!headBody){
      return;
    }
    
    const notification: Notification = {
      userId: command.event.listing.user_id,
      listingId: "" + command.event.listing.listing_id,
      head: headBody.head,
      body: headBody.body,
      type: "ListingEdited",
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

    const notificationsDoc = await this.notifRepo.getNotifications(command.event.listing.user_id);
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
    if(status == StatusEnum.EDITED){
      return {
        head: "You recently edited a listing",
        body: "Your listing  at " + address + " was recently edited and is now pending approval. You will be notified"
        + " when the approval status changes"
      }
      
    }

    return null;
  }
}
