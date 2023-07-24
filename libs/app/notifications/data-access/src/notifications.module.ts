import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from './notifications.service';

@NgModule({
  imports: [CommonModule],
  providers: [NotificationsService]
})
export class NotificationsModule {}
