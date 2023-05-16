import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CopyrightPageRoutingModule } from './copyright-routing.module';

import { CopyrightPage } from './copyright.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CopyrightPageRoutingModule
  ],
  declarations: [CopyrightPage]
})
export class CopyrightPageModule {}
