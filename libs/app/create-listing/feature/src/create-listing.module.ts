import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateListingPageRoutingModule } from './create-listing.routing';

import { CreateListingPage } from './create-listing.page';

import { AuthModule } from '@properproperty/app/auth/data-access'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateListingPageRoutingModule,
    AuthModule
  ],
  declarations: [CreateListingPage]
})
export class CreateListingPageModule {}
