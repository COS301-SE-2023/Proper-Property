import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SubscribeToAuthState } from '@properproperty/app/auth/util';
import { Select } from '@ngxs/store';
import { AuthState } from '@properproperty/app/auth/data-access';
import { Observable } from 'rxjs';
import { Unsubscribe, User } from 'firebase/auth';
// import { SubscribeToUserProfile, UnsubscribeFromUserProfile } from '@properproperty/app/user/util';
import { UserProfileState } from '@properproperty/app/profile/data-access';
import { HostListener } from '@angular/core';
import { httpsCallable, Functions } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { isDevMode } from '@angular/core';
// import { GetUserProfileRequest, GetUserProfileResponse, UpdateUserProfileRequest, UpdateUserProfileResponse, profile } from '@properproperty/api/profile/util';

@Component({
  selector: 'proper-property-app',
  templateUrl: './core.shell.html',
  styleUrls: ['./core.shell.scss'],
})
export class CoreShellComponent implements OnInit, OnDestroy{
  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  public loggedIn = false;
  private user: User | null = null;
  dev: boolean;
  private userProfileListener: Unsubscribe | null = null;
  constructor(private readonly router: Router, private readonly store: Store, private readonly functions: Functions) {
    this.dev = isDevMode();
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
  }
  
  ngOnInit() {
    this.store.dispatch(new SubscribeToAuthState());
  }
  // Unsubscribes from snapshot listener when window is unloaded
  @HostListener('window:beforeunload')
  ngOnDestroy() {
    if (this.userProfileListener) {
      this.userProfileListener();
    }
  }

  async test() {// very duct tape, much jank. 10/10
    alert ("OI");
    const test = await httpsCallable(this.functions, 'getAnalyticsData')();
    console.log(test);
    // const getUserProfile = httpsCallable<
    //   GetUserProfileRequest,
    //   GetUserProfileResponse
    // >(this.functions, 'getUserProfile');

    // const updateUserProfile = httpsCallable<
    //   UpdateUserProfileRequest,
    //   UpdateUserProfileResponse
    // >(this.functions, 'updateUserProfile');
    // let getresponse: GetUserProfileResponse;
    // let profile: profile | null = null;
    // if (this.user){
    //   getresponse = (await getUserProfile({userId: this.user.uid})).data;
    //   profile = getresponse.user;
    //   console.warn(profile);
    // }
    // let updateResponse: UpdateUserProfileResponse;
    // if (profile) {
    //   profile.email = 'test@mail.com';
    //   console.log(profile);
    //   updateResponse = (await updateUserProfile({user: profile})).data;
    //   console.warn(updateResponse);
    // }
  }
}