import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer.component';
import { IonicModule } from '@ionic/angular';
import { FooterRoutingModule } from './footer.routing';

@NgModule({
  imports: [CommonModule, IonicModule, FooterRoutingModule],
  declarations: [FooterComponent],
  exports: [FooterComponent]
})
export class FooterModule {}
