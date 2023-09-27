import { Component, OnInit } from '@angular/core';
import { AuthService } from '@properproperty/app/auth/data-access';
import { AuthProviderLogin } from '@properproperty/app/auth/util';
import { Router } from '@angular/router'
import { UserProfileService } from '@properproperty/app/profile/data-access';
import { Store } from '@ngxs/store';
import { Login } from '@properproperty/app/auth/util';
import { AuthState } from '@properproperty/app/auth/data-access';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { Select } from '@ngxs/store';
import { UserProfileState } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  userProfile: UserProfile | null = null;

  isMobile = false;

  constructor(private readonly store: Store,
    public authService: AuthService, 
    public router: Router,
    public userService : UserProfileService) {
    this.email = this.password = "";
    this.isMobile = isMobile();
  }

  
  email: string;
  password: string;

  async login() {
    this.store.dispatch(new Login(this.email, this.password));
  }

  async googleLogin(){
    this.store.dispatch(new AuthProviderLogin());

    this.user$.subscribe((user) => {
      this.userProfile$.subscribe((profile) => {
        this.userProfile = profile;
        // if (profile) {
        //   if(!profile.firstName){
        //     profile.firstName = user?.displayName?.split(" ")[0];
        //     profile.lastName = user?.displayName?.split(" ")[1];
        //   }
        // }
      });
      
    });
  }

  ngOnInit() {
    if (window.location.hostname.includes("localhost"))
      console.log ("Linter: Lifecycle methods should not be empty");
  }

}

function isMobile(): boolean {
  return window.innerWidth <= 576;
}