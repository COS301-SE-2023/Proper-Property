import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ListingsPage } from './listings.page';

import { ListingsPageRoutingModule } from './listings-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListingsPageRoutingModule
  ],
  declarations: [ListingsPage]
})
export class ListingsPageModule {}
