import { Component, inject, OnInit,ViewChild,ElementRef,Inject,HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserProfileService } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import Swiper from 'swiper';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { Router ,NavigationEnd} from '@angular/router';
import { DOCUMENT } from '@angular/common';


// import { Storage, ref } from '@angular/fire/storage';
// import { uploadBytes } from 'firebase/storage';

declare const gtag: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  isMobile: boolean;
  @ViewChild('address', { static: true }) addressInput!: ElementRef<HTMLInputElement>;

  // public autocomplete: any;

  public predictions: google.maps.places.AutocompletePrediction[] = [];


  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  swiperSlideChanged(e:Event) {
    console.log('changed', e)
  }

  
  public home!: string;
  private activatedRoute = inject(ActivatedRoute);
  currentUser: UserProfile | null = null;
  constructor(public userService : UserProfileService, public gmapsService: GmapsService,private router: Router, @Inject(DOCUMENT) private document: Document) {

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

    this.currentUser = this.userService.getCurrentUser();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    console.log(event);
    this.isMobile = window.innerWidth <= 576;
  }

   ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.home = this.activatedRoute.snapshot.paramMap.get('id') as string;
    const loginBut = document.getElementById('login-button');
    const signupBut = document.getElementById('signup-button');

    if(loginBut && signupBut){
      if(this.currentUser === null){
        console.log("Home page - onInit: Current user is null");
        loginBut.style.visibility = 'visible';
        signupBut.style.visibility = 'visible';
      }
      else{
        console.log("Home page - onInit: " + this.userService.printCurrentUser());
        loginBut.style.visibility = 'hidden';
        signupBut.style.visibility = 'hidden';
      }
    }
    
    const inputElementId = 'address';

    
    
    this.gmapsService.setupRegionSearchBox(inputElementId);
  }

  searchQuery = '';
  //to be implemented
  searchProperties() {
    // Get the search query from the input field
    this.searchQuery = (document.getElementById("address") as HTMLInputElement).value;

    // Redirect to the search page with the search query as a parameter
    this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
  }
  // swiperReady() {
  //   this.swiper = this.swiperRef?.nativeElement.swiper;
  // }

  // goNext() {
  //   this.swiper?.slideNext();
  // }
  // goPrev() {
  //   this.swiper?.slidePrev();
  // }
}
