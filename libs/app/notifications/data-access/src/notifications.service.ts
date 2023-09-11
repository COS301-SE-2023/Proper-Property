import { Injectable } from "@angular/core";
import { Messaging, getToken } from "@angular/fire/messaging";
import { httpsCallable, Functions } from '@angular/fire/functions';
@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  constructor(private readonly messaging: Messaging, private readonly functions: Functions){}

  async registerNotifications(userId: string) {
    console.log('key: ', process.env['NX_FCM_VAPID_KEY']);
    let token = "whups";
    const res = await Notification.requestPermission();
    console.log(res);
    if (res == 'granted') {
      token = await getToken(this.messaging, {vapidKey: process.env['NX_FCM_VAPID_KEY']});
      console.log(token);
    }
    console.log(userId); //log for linter
    return token;
  }

  async sendNotification(token: string, title: string, body: string) {
    httpsCallable<{token: string, notification: {title: string, body: string}}, void>(
      this.functions,
      'sendNotification'
    )({token: token, notification: {title: title, body: body}});
  }
}

