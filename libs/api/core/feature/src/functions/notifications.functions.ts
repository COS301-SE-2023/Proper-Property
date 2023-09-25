import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
export const sendNotification = functions.region('europe-west1').https.onCall(
  async (
    request: {token: string, notification: {title: string, body: string}}
  ) => {
    const notificationMessage: admin.messaging.Message = {
      token: request.token,
      notification: {
        title: request.notification.title,
        body: request.notification.body
      }
    };
    console.log("NOTIF:");
    console.log(notificationMessage);
    admin.messaging().sendEach([notificationMessage]);
  }
);