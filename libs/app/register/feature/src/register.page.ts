import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '@properproperty/app/auth/data-access';
import { Router, ActivatedRoute } from '@angular/router';
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
  private activatedRoute = inject(ActivatedRoute);
  constructor(private readonly store: Store, public authService: AuthService,
     public router: Router, 
     public userProfileService: UserProfileService,) {
    this.name = this.surname = this.password = this.email = this.confirm_password = "";
    this.isMobile = isMobile();

  }

  name:string;
  surname:string;
  password:string = "";
  email:string;
  confirm_password:string;
  passwordMatch = true;
  validEmail=true;
  showPassword = false;

  async register() {
    
    if(!checkFields(this.email, this.password, this.confirm_password)){
      return;
    }

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

  strengthScore = 0;
  isStrong = false;
  lowercase = false;
  uppercase = false;
  numbers = false;
  specialchars = false;
  length = 0;
  checkStrength(){
    this.passwordMatch =  (this.password === this.confirm_password)
      
    this.length = this.password.length;
    document.getElementById("sec1")?.setAttribute("style", "");
      document.getElementById("sec2")?.setAttribute("style", "");
      document.getElementById("sec3")?.setAttribute("style", "");
    this.strengthScore = 0;
    const upperCase = /[A-Z]{1}/;
    const lowerCase = /[a-z]{1}/;
    const numbers = /[0-9]{1}/;
    const specialChars = /[\[\].!#$%&'*+\/=?^_`{|}~-]{1}/;
    this.uppercase = upperCase.test(this.password);
    if(this.uppercase){
      console.log("uppcase");
      this.strengthScore += 2;
    }
    else{
      this.strengthScore -= 1;
    }
    this.lowercase = lowerCase.test(this.password);
    if(this.lowercase){
      console.log("lowercase");
      this.strengthScore += 2;
    }else{
      this.strengthScore -= 1;
    }
    this.numbers = numbers.test(this.password);
    if(this.numbers){
      console.log("numbers");
      this.strengthScore += 2;
    }else{
      this.strengthScore -= 1;
    }
    this.specialchars = specialChars.test(this.password);
    if(this.specialchars){
      console.log("specialChars");
      this.strengthScore += 2;
    }else{
      this.strengthScore -= 1;
    }

    if(this.length <= 5){
      this.strengthScore = 0;
    }
    else if(this.length >= 5 && this.length < 8){
      this.strengthScore += 6
    }
    else if(this.length >= 8 && this.length < 15){
      console.log("long boi")
      this.strengthScore += 10;
    }
    else if(this.length >= 15){
      this.strengthScore += 18
    }
    this.isStrong = this.length > 8 && this.uppercase && this.lowercase && this.numbers && this.specialchars;
    if(this.strengthScore <= 3){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 50%; background-color: red");
    }
    else if(this.strengthScore > 3 && this.strengthScore <= 6){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 100%; background-color: red");
    }
    else if(this.strengthScore > 6 && this.strengthScore <= 9){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 100%; background-color: red");
      document.getElementById("sec2")?.setAttribute("style", "height: 100%; width: 50%; background-color: red");
    }
    else if(this.strengthScore > 9 && this.strengthScore <= 12){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 100%; background-color: orange");
      document.getElementById("sec2")?.setAttribute("style", "height: 100%; width: 100%; background-color: orange");
    }
    else if(this.strengthScore > 12 && this.strengthScore <= 15){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 100%; background-color: orange");
      document.getElementById("sec2")?.setAttribute("style", "height: 100%; width: 100%; background-color: orange");
      document.getElementById("sec3")?.setAttribute("style", "height: 100%; width: 50%; background-color: orange");
    }
    else if(this.strengthScore > 15){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 100%; background-color: green");
      document.getElementById("sec2")?.setAttribute("style", "height: 100%; width: 100%; background-color: green");
      document.getElementById("sec3")?.setAttribute("style", "height: 100%; width: 100%; background-color: green");
    }

    console.log(this.strengthScore);
  }

  showPass(){
    this.showPassword = !this.showPassword;
  }
}

function isMobile(): boolean {
  return window.innerWidth <= 576;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

function checkFields(email: string, password: string, confirmPassword: string): boolean {
  if (!email || !password || !confirmPassword) {
    alert("Please enter all fields");
    return false;
  }
  return true;
}