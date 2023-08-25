// import { Timestamp } from '@firebase/firestore';
import { Notification } from './notification.interface';
export interface NotificationsDoc {
  userId: string;
  notifications: Notification[];
}