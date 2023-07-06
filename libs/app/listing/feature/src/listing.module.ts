import { Inject, NgModule } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListingPageRoutingModule } from './listing.routing';

import { ListingPage } from './listing.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListingPageRoutingModule
  ],
  declarations: [ListingPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ListingPageModule {}
