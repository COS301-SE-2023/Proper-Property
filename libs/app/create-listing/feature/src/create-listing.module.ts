import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from'@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input'; 
import { IonicModule } from '@ionic/angular';

import { CreateListingPageRoutingModule } from './create-listing.routing';

import { CreateListingPage } from './create-listing.page';

import { AuthModule } from '@properproperty/app/auth/data-access';
import { FooterModule } from '@properproperty/app/footer/feature';
import { ReactiveFormsModule } from '@angular/forms';

import {OverlayModule} from '@angular/cdk/overlay';



@NgModule({
  imports: [
    MatAutocompleteModule,
    CommonModule,
    FormsModule,
    IonicModule,
    CreateListingPageRoutingModule,
    AuthModule,
    FooterModule,
    MatInputModule,
    ReactiveFormsModule,
    OverlayModule
  ],
  declarations: [CreateListingPage]
})
export class CreateListingPageModule {}
