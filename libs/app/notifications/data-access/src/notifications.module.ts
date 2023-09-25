import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from './notifications.service';
import { NgxsModule } from '@ngxs/store';
import { NotificationsState } from './notifications.state';
@NgModule({
  imports: [
    CommonModule,
    NgxsModule.forFeature([NotificationsState]),
  ],
  providers: [NotificationsService]
})
export class NotificationsModule {}
