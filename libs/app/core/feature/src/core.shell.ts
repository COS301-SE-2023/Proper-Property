import { 
  Component, 
  OnDestroy, 
  OnInit,
  Inject,
  HostListener, 
  inject,
  isDevMode,
  AfterViewInit
} from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { SubscribeToAuthState } from '@properproperty/app/auth/util';
import { NotificationsState } from '@properproperty/app/notifications/data-access';
import { Observable } from 'rxjs';
import { Unsubscribe } from 'firebase/auth';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UserProfileState,UserProfileService } from '@properproperty/app/profile/data-access';
import { Functions } from '@angular/fire/functions';
import { NotificationsService } from 'libs/app/notifications/data-access/src/notifications.service';


import { DOCUMENT } from '@angular/common';
import { Notification } from '@properproperty/api/notifications/util';
import { UserProfile } from '@properproperty/api/profile/util';
import { DeviceDetectorService } from 'ngx-device-detector';
declare const gtag: any;

@Component({
  selector: 'proper-property-app',
  templateUrl: './core.shell.html',
  styleUrls: ['./core.shell.scss'],
})
export class CoreShellComponent implements OnInit, OnDestroy, AfterViewInit {
  
  isMobile: boolean;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  @Select(NotificationsState.notifications) notifications$!: Observable<Notification[] | null>;
  @Select(NotificationsState.notificationsListener) notificationsListener$!: Observable<Unsubscribe | null>;
  public loggedIn = false;
  public admin = false;
  public dev: boolean;
  private userProfile: UserProfile | null = null;
  private userProfileListener: Unsubscribe | null = null;
  private notificationsListener: Unsubscribe | null = null;
  public notifications: Notification[] = [];
  public showNotifications = false;
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

    this.notificationsListener$.subscribe((listener) => {
      this.notificationsListener = listener;
    });

    this.notifications$.subscribe((notifications) => {
      this.notifications = notifications?.reverse() ?? [];
    });
    this.userProfile$.subscribe((profile) => {
      let destination = '';
      if(this.router.url == "/login" || this.router.url == "/register"){
        destination = '/'
      }
      
      if (!this.loggedIn && profile && (!profile.firstName || !profile.lastName)) {
        destination = '/profile';
      }
      this.userProfile = profile;
      this.loggedIn = this.userProfile != null && this.userProfile != undefined;
      this.admin = (profile && profile.admin) ?? false;
      if (destination) this.router.navigate([destination]);
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
  ngAfterViewInit(): void {
    // if desktop, assign "Desktop" class to body
    if (!this.isMobile) {
      this.document.body.classList.add('Desktop');
    }
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
    if (!event) console.log(event);
    this.isMobile = window.innerWidth <= 576;
  }

  async test() {// very duct tape, much jank. 10/10

    if (isDevMode()) {
      alert ("OI");
      this.notificationsService.sendNotification(this.NotificationToken, "this is a title", "this is a body");
    }
  }

  async toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
}