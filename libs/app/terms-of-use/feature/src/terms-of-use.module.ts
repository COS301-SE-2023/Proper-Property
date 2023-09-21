import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermsOfUsePageRoutingModule } from './terms-of-use.routing';

import { TermsOfUsePage } from './terms-of-use.page';
import { FooterModule } from '@properproperty/app/footer/feature';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsOfUsePageRoutingModule,
    FooterModule
  ],
  declarations: [TermsOfUsePage]
})
export class TermsOfUsePageModule {}
