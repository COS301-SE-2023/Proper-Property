import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPage } from './admin.page';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AdminPageRoutingModule } from './admin.routing';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AdminPageRoutingModule
  ],
  declarations: [AdminPage],
})
export class AdminPageModule {}
