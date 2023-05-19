import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VersionPageRoutingModule } from './version-routing.module';

import { VersionPage } from './version.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VersionPageRoutingModule
  ],
  declarations: [VersionPage]
})
export class VersionPageModule {}
