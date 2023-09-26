import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListingPageRoutingModule } from './listing.routing';
import { ListingModule as ListingDataAccessModule } from '@properproperty/app/listing/data-access'
import { ListingPage } from './listing.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FooterModule } from '@properproperty/app/footer/feature';

import { SpeechSynthesisModule } from '@ng-web-apis/speech'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListingPageRoutingModule,
    ListingDataAccessModule,
    FooterModule,
    SpeechSynthesisModule
  ],
  declarations: [ListingPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ListingPageModule {}
