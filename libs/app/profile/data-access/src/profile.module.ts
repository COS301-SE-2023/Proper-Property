import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { UserProfileState } from './profile.state';
import { UserService } from './profile.service';

@NgModule({
  imports: [
    CommonModule,
    NgxsModule.forFeature([UserProfileState])
  ],
  providers: [UserService]
})
export class UserProfileModule {}