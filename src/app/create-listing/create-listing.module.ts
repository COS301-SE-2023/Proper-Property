import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateListingPageRoutingModule } from './create-listing-routing.module';

import { CreateListingPage } from './create-listing.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    CreateListingPageRoutingModule
  ],
  declarations: [CreateListingPage]
})
export class CreateListingPageModule {}
