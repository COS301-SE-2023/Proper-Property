import { Component, OnDestroy, OnInit,Inject,HostListener, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { SubscribeToAuthState } from '@properproperty/app/auth/util';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Unsubscribe } from 'firebase/auth';
// import { SubscribeToUserProfile, UnsubscribeFromUserProfile } from '@properproperty/app/user/util';
import { UserProfileState,UserProfileService } from '@properproperty/app/profile/data-access';


import { ActivatedRoute } from '@angular/router';
import { httpsCallable, Functions } from '@angular/fire/functions';
import { isDevMode } from '@angular/core';
// import { GetUserProfileRequest, GetUserProfileResponse, UpdateUserProfileRequest, UpdateUserProfileResponse, profile } from '@properproperty/api/profile/util';


import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { UserProfile } from '@properproperty/api/profile/util';

declare const gtag: any;

@Component({
  selector: 'proper-property-app',
  templateUrl: './core.shell.html',
  styleUrls: ['./core.shell.scss'],
})
export class CoreShellComponent implements OnInit, OnDestroy {
  
  isMobile: boolean;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  public loggedIn = false;
  public admin = false;
  private userProfile: UserProfile | null = null;
  dev: boolean;
  private userProfileListener: Unsubscribe | null = null;

  private activatedRoute = inject(ActivatedRoute);

  constructor(private readonly router: Router, private readonly store: Store, private readonly functions: Functions, @Inject(DOCUMENT) private document: Document,private profileServices : UserProfileService) {
    this.dev = isDevMode();
    this.loggedIn = this.userProfile$ != null && this.userProfile$ != undefined;

    this.userProfile$.subscribe((user) => {
      this.userProfile = user;
      this.loggedIn = user != null && user != undefined;
      
    });
    // Update listener whenever is changes such that it can be unsubscribed from
    // when the window is unloaded
    this.userProfileListener$.subscribe((listener) => {
      this.userProfileListener = listener;
    });

    this.userProfile$.subscribe((profile) => {
      this.userProfile = profile;
      this.loggedIn = this.userProfile != null && this.userProfile != undefined;
      this.admin = (profile && profile.admin) ?? false;
    });

    this.isMobile = window.innerWidth <= 576;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        gtag('event', 'page_view', {
          'page_path': event.urlAfterRedirects,
          'page_location': this.document.location.href,
          'is_mobile': this.isMobile ? 'yes' : 'no',
        });
      }
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

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    console.log(event);
    this.isMobile = window.innerWidth <= 576;
  }

  async test() {// very duct tape, much jank. 10/10

    if (isDevMode()) {
    alert ("OI");
    const test = JSON.parse((await httpsCallable(this.functions, 'getAnalyticsData')()).data as string);
    const dates : Date[] = [];
    const pageViews : number[] = [];

    const rows = test.rows ?? [];
    for(let i = 0; rows && i < rows.length; i++){
      if (rows[i] && rows[i].dimensionValues[1] && rows[i].metricValues[0]) {
        const dimensionValue = rows[i].dimensionValues[1].value;
        const year = Number(dimensionValue.substring(0,4));
        const month = Number(dimensionValue.substring(4,6));
        const day = Number(dimensionValue.substring(6,8));

        dates[i] = new Date(year, month, day);

        const metricValue = rows[i].metricValues[0].value;
        pageViews[i] = Number(metricValue);
      }
    }

    console.log({pageViews, dates});
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
}