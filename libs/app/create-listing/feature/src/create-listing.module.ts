import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateListingPageRoutingModule } from './create-listing.routing';

import { CreateListingPage } from './create-listing.page';

import { AuthModule } from '@properproperty/app/auth/data-access';
import { FooterComponent } from '../../../footer/feature/src/footer.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateListingPageRoutingModule,
    AuthModule
  ],
  declarations: [CreateListingPage, FooterComponent]
})
export class CreateListingPageModule {}
