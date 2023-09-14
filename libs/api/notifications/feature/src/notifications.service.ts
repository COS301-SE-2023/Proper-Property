import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  NotifyApprovalChangeCommand,
  NotifyStatusChangeCommand,
  NotifyViewDropCommand
} from '@properproperty/api/notifications/util';
import * as admin from 'firebase-admin';
@Injectable()
export class NotificationsService {
  constructor(private readonly commandBus: CommandBus) {}

  async sendNotification(token: string, notif:{title: string, body: string}) {
    admin.messaging().sendEach([
      {
        token: token,
        notification: notif
      }
    ])
  }

  async approvalChange(userId: string, listingId: string, status: boolean, reason: string) {
    this.commandBus.execute(new NotifyApprovalChangeCommand(userId, listingId, status, reason));
  } 

  async ApprovalChange(listingId: string, status: string) {
    this.commandBus.execute(new NotifyStatusChangeCommand(listingId, status));
  }

  async viewDrop(listingId: string, userId: string) {
    this.commandBus.execute(new NotifyViewDropCommand(listingId, userId));
  }

}