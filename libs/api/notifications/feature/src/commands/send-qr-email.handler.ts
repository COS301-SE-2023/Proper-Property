import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { NotifyApprovalChangeCommand, Notification, SendQREmailCommand, NotifyViewDropCommand } from '@properproperty/api/notifications/util';
import { Timestamp } from 'firebase-admin/firestore';
import { NotificationsDocModel } from '../models/notifications.model';
import { NotificationsRepository } from '@properproperty/api/notifications/data-access';
import  * as nodemailer  from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { ProfileRepository } from '@properproperty/api/profile/data-access';

@CommandHandler(SendQREmailCommand)
export class SendQREmailHandler implements ICommandHandler<SendQREmailCommand> {
  constructor(
    private readonly notifRepo: NotificationsRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly profileRepo: ProfileRepository 
  ){}
  async execute(command: SendQREmailCommand) {
    console.log('---NotifyApprovalChangeCommand: ' + command.req.address);
    if (!command.req.lister) {
      console.log('---User profile not found');
      return;
    }
    if (!command.req.lister.email) {
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
    
    const headBody = {
      head: "Your listing was recently visited by an interested party" ,
      body: "Your listing at " + command.req.address + " was recently visited through the QR code you provided. If "
        + "you wish to view more analytics on your listing please visit its page on the ProperProperty website at "
        + command.req.url
    }
    if(!headBody){
      return;
    }
    // legacy code before it's even implemented - ?? coulda just sent the email in the cloud function

    // or you could use more node thread like a real cs student THREEEEAADDDSSS
    // gotta use them threads 
    //Lets move it over, we can just copy paste over?
    // it's already here
    // not inefficient?
    // it is but I'm lazy
    // fair enough - from gpt
     
    // fair enough
    const mailoptions = {
      from: creds.user,
      to: command.req.lister.email,
      subject: headBody.head,
      text: headBody.body
    };
    
    transporter.sendMail(mailoptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}
