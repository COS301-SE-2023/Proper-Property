import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GmapsService } from './google-maps.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [GmapsService]
})
export class GoogleMapsModule {}