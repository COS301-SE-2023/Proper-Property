import { Timestamp } from '@firebase/firestore';

export interface Notification {
  userId: string;
  listingId: string;
  head: string;
  body: string;
  type: string;
  senderId: string;
  date: Timestamp;
}