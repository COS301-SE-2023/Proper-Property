import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { AuthState } from './auth.state';
import { AuthService } from './auth.service';

@NgModule({
  imports: [
    CommonModule,
    NgxsModule.forFeature([AuthState])
  ],
  providers: [AuthService]
})
export class AuthModule {}