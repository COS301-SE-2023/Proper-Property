import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivacyPolicyPageRoutingModule } from './privacy-policy.routing';

import { PrivacyPolicyPage } from './privacy-policy.page';
import { FooterModule } from '@properproperty/app/footer/feature';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivacyPolicyPageRoutingModule,
    FooterModule
  ],
  declarations: [PrivacyPolicyPage]
})
export class PrivacyPolicyPageModule {}
