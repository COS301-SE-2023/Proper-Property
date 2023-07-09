import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TesterPageComponent } from './tester.page';
import { TesterPageRoutingModule } from './tester.routing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [
    CommonModule,
    TesterPageRoutingModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [TesterPageComponent],
})
export class TesterModule {}
