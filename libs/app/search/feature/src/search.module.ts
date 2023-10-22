import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPageRoutingModule } from './search.routing';

import { SearchPage } from './search.page';
import { FooterModule } from '@properproperty/app/footer/feature';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    SearchPageRoutingModule,
    FooterModule,
  ],
  declarations: [SearchPage],
})
export class SearchPageModule {}
