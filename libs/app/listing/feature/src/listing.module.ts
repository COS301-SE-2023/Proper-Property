import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListingPageRoutingModule } from './listing.routing';

import { ListingPage } from './listing.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { NavigationEnd, Router } from '@angular/router';

declare const gtag: Function;

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListingPageRoutingModule
  ],
  declarations: [ListingPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ListingPageModule {
  // constructor(){}
  constructor(public router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-4ZKFFSPB4D', { 'page_path': event.urlAfterRedirects });
        console.log(event.urlAfterRedirects);
      }      
    })
  }
}
