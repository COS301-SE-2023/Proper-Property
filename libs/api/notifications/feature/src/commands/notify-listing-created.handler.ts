import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { NotifyListingCreatedCommand, Notification } from '@properproperty/api/notifications/util';
import { Timestamp } from 'firebase-admin/firestore';
import { NotificationsDocModel } from '../models/notifications.model';
import { NotificationsRepository } from '@properproperty/api/notifications/data-access';
import  * as nodemailer  from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { ProfileRepository } from '@properproperty/api/profile/data-access';
import { StatusEnum } from '@properproperty/api/listings/util';
@CommandHandler(NotifyListingCreatedCommand)
export class NotifyListingCreatedHandler implements ICommandHandler<NotifyListingCreatedCommand> {
  constructor(
    private readonly notifRepo: NotificationsRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly profileRepo: ProfileRepository 
  ){}
  async execute(command: NotifyListingCreatedCommand) {
    const profile = (await this.profileRepo.getUserProfile(command.event.listing.user_id)).user;
    if (!profile) {
      return;
    }
    if (!profile.email) {
      return;
    }
    const cred_path = path.join(__dirname, '..', '..', '..', 'victorias-secret-google-credentials', 'spambot-9000-inator.json');
    
    const creds = JSON.parse(fs.readFileSync(cred_path, 'utf8'));
    const transporter = nodemailer.createTransport({
      secure: true,
      service: 'gmail',
      auth: {
        user: process.env['NX_SPAMBOT_ADDRESS'],
        pass: process.env['NX_SPAMBOT_APP_PASSWORD']
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
      type: "ListingCreated",
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
      if (!info) console.log(info);
      if (err) {
        console.log(err);
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
    if(status == StatusEnum.PENDING_APPROVAL){
      return{
        head: "Listing approval is pending",
        body: "Your listing  at " + address + " is currently pending approval and cannot be viewed by other users. You" 
        + " will be notified when the approval status changes"
      }
    }
    
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
