import { Injectable } from "@angular/core";
import { Messaging, getToken, getMessaging } from "@angular/fire/messaging";
@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  constructor(private readonly messaging: Messaging){}

  async registerNotifications(userId: string) {
    console.log('key: ', process.env['NX_FCM_VAPID_KEY']);
    let token = "whups";
    let res = await Notification.requestPermission();
    console.log(res);
    if (res == 'granted') {
      token = await getToken(this.messaging, {vapidKey: process.env['NX_FCM_VAPID_KEY']});
      console.log(token);
    }
    return token;
  }
}

