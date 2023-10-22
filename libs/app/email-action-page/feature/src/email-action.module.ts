import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmailActionRoutingModule } from './email-action.routing';

import { EmailActionPage } from './email-action.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FooterModule } from '@properproperty/app/footer/feature';

@NgModule({
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule, 
    EmailActionRoutingModule,
    FooterModule
  ],
  declarations: [EmailActionPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmailActionModule {}
