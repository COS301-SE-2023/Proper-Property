import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateListingPageRoutingModule } from './create-listing.routing';

import { CreateListingPage } from './create-listing.page';

import { AuthModule } from '@properproperty/app/auth/data-access';
import { FooterModule } from '@properproperty/app/footer/feature';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateListingPageRoutingModule,
    AuthModule,
    FooterModule
  ],
  declarations: [CreateListingPage, FooterComponent]
})
export class CreateListingPageModule {}
