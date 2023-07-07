import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { UserProfileState } from './user.state';
import { UserService } from './user.service';

@NgModule({
  imports: [
    CommonModule,
    NgxsModule.forFeature([UserProfileState])
  ],
  providers: [UserService]
})
export class UserProfileModule {}