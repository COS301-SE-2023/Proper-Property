import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyListingsPageRoutingModule } from './my-listings.routing';

import { MyListingsPage } from './my-listings.page';

import {AuthModule} from '@properproperty/app/auth/data-access'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyListingsPageRoutingModule,
    AuthModule
  ],
  declarations: [MyListingsPage]
})
export class MyListingsPageModule {}
