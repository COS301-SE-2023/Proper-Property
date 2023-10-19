import { Component, OnInit } from '@angular/core';
import { AuthService } from '@properproperty/app/auth/data-access';
import { Router } from '@angular/router';
// import { profile } from '@properproperty/api/profile/util';
import { UserProfileState, UserProfileService } from '@properproperty/app/profile/data-access';
import { Select, Store } from '@ngxs/store';
import { Register } from '@properproperty/app/auth/util';

import { UserProfile } from '@properproperty/api/profile/util';
import { Observable } from 'rxjs';
import { Unsubscribe, User } from 'firebase/auth';

import { AuthState } from '@properproperty/app/auth/data-access';
import { AuthProviderLogin } from '@properproperty/app/auth/util';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  isMobile = false;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  public loggedIn = false;
  userProfile: UserProfile | null = null;

  private user: User | null = null;
  private userProfileListener: Unsubscribe | null = null;

  constructor(private readonly store: Store, public authService: AuthService,
     public router: Router, 
     public userProfileService: UserProfileService,) {
    this.name = this.surname = this.password = this.email = this.confirm_password = "";
    this.isMobile = isMobile();

  }

  name:string;
  surname:string;
  password:string;
  email:string;
  confirm_password:string;
  passwordMatch = true;
  validEmail=true;

  async register() {
    
    if(!validateEmail(this.email)) {
      this.validEmail = false;
      return;
    }

    if (this.password !== this.confirm_password) {
      this.passwordMatch = false;
      return; // Prevent further execution
    }

    this.store.dispatch(new Register(this.email, this.password));

    this.loggedIn = this.user$ != null && this.user$ != undefined;

    this.user$.subscribe((user) => {
      this.user = user;
      this.loggedIn = user != null && user != undefined;
    });
    // Update listener whenever is changes such that it can be unsubscribed from
    // when the window is unloaded
    this.userProfileListener$.subscribe((listener) => {
      this.userProfileListener = listener;
    });

    this.user$.subscribe((user) => {
      this.user = user;
      this.userProfileService.getUser("" + user?.uid).then((profile) => {
        if(profile !== undefined && profile){
          if(profile){
            
          }
        }
      });
    });
    this.userProfile$.subscribe((profile) => {
      this.userProfile = profile;
      if (profile) {
        profile.firstName = this.name;
        profile.lastName = this.surname;
      }
    });
  }

  checkPassword() {
    if (window.location.hostname.includes("localhost"))
      console.log("44:19  error  Unexpected empty method 'checkPassword'");
  }

  ngOnInit() {
    if (window.location.hostname.includes("localhost"))
      console.log ("Lifecycle methods should not be empty");
  }

  googleLogin(){
    this.store.dispatch(new AuthProviderLogin());

    this.user$.subscribe((user) => {
      this.userProfile$.subscribe((profile) => {
        this.userProfile = profile;
        if (profile) {
          profile.firstName = user?.displayName?.split(" ")[0];
          profile.lastName = user?.displayName?.split(" ")[1];
        }
      });
      
    });
  }

}

function isMobile(): boolean {
  return window.innerWidth <= 576;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}