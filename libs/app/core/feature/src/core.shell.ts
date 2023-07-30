import { Component, OnDestroy, OnInit,Inject,HostListener, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { SubscribeToAuthState } from '@properproperty/app/auth/util';
import { Select } from '@ngxs/store';
import { AuthState } from '@properproperty/app/auth/data-access';
import { Observable } from 'rxjs';
import { Unsubscribe, User } from 'firebase/auth';
// import { SubscribeToUserProfile, UnsubscribeFromUserProfile } from '@properproperty/app/user/util';
import { UserProfileState,UserProfileService } from '@properproperty/app/profile/data-access';


import { ActivatedRoute } from '@angular/router';
import { httpsCallable, Functions } from '@angular/fire/functions';
import { isDevMode } from '@angular/core';
// import { GetUserProfileRequest, GetUserProfileResponse, UpdateUserProfileRequest, UpdateUserProfileResponse, profile } from '@properproperty/api/profile/util';


import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

declare const gtag: Function;

@Component({
  selector: 'proper-property-app',
  templateUrl: './core.shell.html',
  styleUrls: ['./core.shell.scss'],
})
export class CoreShellComponent implements OnInit, OnDestroy {
  
  isMobile: boolean;
  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  public loggedIn = false;
  public admin = false;
  private user: User | null = null;
  dev: boolean;
  private userProfileListener: Unsubscribe | null = null;

  private activatedRoute = inject(ActivatedRoute);

  constructor(private readonly router: Router, private readonly store: Store, private readonly functions: Functions, @Inject(DOCUMENT) private document: Document,private profileServices : UserProfileService) {
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

    this.user$.subscribe((user) => {
      this.user = user;
      this.profileServices.getUser("" + user?.uid).then((profile) => {
        if(profile !== undefined && profile){
          if(profile.admin){
            this.admin = true;
          }
          else{
            router.navigate(['/home']);
          }
        }
      });
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
      console.log("indeed ",this.isMobile);
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
    this.isMobile = window.innerWidth <= 576;
  }

  async test() {// very duct tape, much jank. 10/10

    if (isDevMode()) {
    alert ("OI");
    const test : any = (await httpsCallable(this.functions, 'getAnalyticsData')()).data;
    let dates : Date[] = [];
    let pageViews : number[] = [];

    let rows: any = test.rows ?? [];
    for(let i = 0; rows && i < rows.length; i++){
      if (rows[i] && rows[i].dimensionValues[1] && rows[i].metricValues[0]) {
        let dimensionValue = rows[i].dimensionValues[1].value;
        let year : number = Number(dimensionValue.substring(0,4));
        let month : number = Number(dimensionValue.substring(4,6));
        let day : number = Number(dimensionValue.substring(6,8));

        dates[i] = new Date(year, month, day);

        let metricValue = rows[i].metricValues[0].value;
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