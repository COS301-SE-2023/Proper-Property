import { Timestamp } from 'firebase-admin/firestore';

export interface Notification {
  userId: string;
  listingId: string;
  head: string;
  body: string;
  type: string;
  senderId: string;
  date: Timestamp;
}