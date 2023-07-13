import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfilePageRoutingModule } from './profile.routing';
import { ProfilePage } from './profile.page';
import { UserProfileModule as ProfileDataAccesModule } from '../../data-access/src/profile.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    ProfileDataAccesModule
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
