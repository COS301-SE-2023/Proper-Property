import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeRoutingModule } from './home.routing';

import { HomePage } from './home.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FooterModule } from '@properproperty/app/footer/feature';

@NgModule({
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule, 
    HomeRoutingModule,
    FooterModule
  ],
  declarations: [HomePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePageModule {}
