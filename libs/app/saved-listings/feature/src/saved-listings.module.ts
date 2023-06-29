import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SavedListingsPageRoutingModule } from './saved-listings.routing';

import { SavedListingsPage } from './saved-listings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SavedListingsPageRoutingModule
  ],
  declarations: [SavedListingsPage]
})
export class SavedListingsPageModule {}
