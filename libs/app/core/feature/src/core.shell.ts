import { 
  Component, 
  OnDestroy, 
  OnInit,
  Inject,
  HostListener, 
  inject 
} from '@angular/core';
import { Store } from '@ngxs/store';
import { SubscribeToAuthState } from '@properproperty/app/auth/util';
import { Select } from '@ngxs/store';
import { AuthState } from '@properproperty/app/auth/data-access';
import { NotificationsState } from '@properproperty/app/notifications/data-access';
import { Observable } from 'rxjs';
import { Unsubscribe, User } from 'firebase/auth';
// import { SubscribeToUserProfile, UnsubscribeFromUserProfile } from '@properproperty/app/user/util';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UserProfileState,UserProfileService } from '@properproperty/app/profile/data-access';
import { Functions } from '@angular/fire/functions';
import { isDevMode } from '@angular/core';
import { NotificationsService } from 'libs/app/notifications/data-access/src/notifications.service';
// import { GetUserProfileRequest, GetUserProfileResponse, UpdateUserProfileRequest, UpdateUserProfileResponse, profile } from '@properproperty/api/profile/util';


import { DOCUMENT } from '@angular/common';

declare const gtag: any;

@Component({
  selector: 'proper-property-app',
  templateUrl: './core.shell.html',
  styleUrls: ['./core.shell.scss'],
})
export class CoreShellComponent implements OnInit, OnDestroy {
  
  isMobile: boolean;
  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  @Select(NotificationsState.notificationsListener) notificationsListener$!: Observable<Unsubscribe | null>;
  public loggedIn = false;
  public admin = false;
  private user: User | null = null;
  public dev: boolean;
  private userProfileListener: Unsubscribe | null = null;
  private notificationsListener: Unsubscribe | null = null;
  private NotificationToken = 'whups';
  private activatedRoute = inject(ActivatedRoute);
  constructor(
    private readonly router: Router, 
    private readonly store: Store, 
    private readonly functions: Functions, 
    @Inject(DOCUMENT) private document: Document,
    private profileServices : UserProfileService,
    private readonly notificationsService: NotificationsService
  ) {
    this.dev = isDevMode();
    this.loggedIn = this.user$ != null && this.user$ != undefined;

    this.user$.subscribe((user) => {
      this.user = user;
      this.loggedIn = user != null && user != undefined;
      if (this.user) {
        this.notificationsService.registerNotifications(this.user.uid).then(tkn => {
          this.NotificationToken = tkn;
        });
      }
    });
    // Update listener whenever is changes such that it can be unsubscribed from
    // when the window is unloaded
    this.userProfileListener$.subscribe((listener) => {
      this.userProfileListener = listener;
    });

    this.notificationsListener$.subscribe((listener) => {
      this.notificationsListener = listener;
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
  // Unsubscribes from snapshot listeners when window is unloaded
  @HostListener('window:beforeunload')
  ngOnDestroy() {
    if (this.userProfileListener) {
      this.userProfileListener();
    }

    if (this.notificationsListener) {
      this.notificationsListener();
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
      console.log(this.NotificationToken);
      this.notificationsService.sendNotification(this.NotificationToken, "this is a title", "this is a body");
    }
  }
}