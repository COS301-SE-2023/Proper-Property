import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendQREmailCommand } from '@properproperty/api/notifications/util';
import  * as nodemailer  from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@CommandHandler(SendQREmailCommand)
export class SendQREmailHandler implements ICommandHandler<SendQREmailCommand> {
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
    const transporter = nodemailer.createTransport({
      secure: true,
      service: 'gmail',
      auth: {
        user: process.env['NX_SPAMBOT_ADDRESS'],
        pass: process.env['NX_SPAMBOT_APP_PASSWORD']
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
      from: process.env['NX_SPAMBOT_ADDRESS'],
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
