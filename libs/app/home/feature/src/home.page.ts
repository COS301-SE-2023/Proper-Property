import { Component, inject, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserProfileService } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import Swiper from 'swiper';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { Router } from '@angular/router';
// import { LatLngBounds } from '@google/maps';

// import { Storage, ref } from '@angular/fire/storage';
// import { uploadBytes } from 'firebase/storage';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('query', { static: false }) queryInput!: ElementRef<HTMLInputElement>;
  @ViewChild('query1', { static: false }) queryInput1!: ElementRef<HTMLInputElement>;

  isMobile: boolean;
  // public autocomplete: any;

  public predictions: google.maps.places.AutocompletePrediction[] = [];
  predictionsLoading = false;

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  predictionDisplay() {
    return this.predictions.length > 0;
  }

  image1() {
    // Get a reference to the image element by its id
    const imageElement = document.getElementById('myImage') as HTMLImageElement;

    if (imageElement) {
      // New href value
      const newHref = '../assets/house1.png';

      // Update the xlink:href attribute
      imageElement.setAttribute('xlink:href', newHref);
    } else {
      console.error('Image element not found');
    }
  }

  image2() {
    // Get a reference to the image element by its id
    const imageElement = document.getElementById('myImage') as HTMLImageElement;

    if (imageElement) {
      // New href value
      const newHref = '../assets/niceHouse.webp';

      // Update the xlink:href attribute
      imageElement.setAttribute('xlink:href', newHref);
    } else {
      console.error('Image element not found');
    }
  }

  image3() {
    // Get a reference to the image element by its id
    const imageElement = document.getElementById('myImage') as HTMLImageElement;

    if (imageElement) {
      // New href value
      const newHref = '../assets/house5.jpg';

      // Update the xlink:href attribute
      imageElement.setAttribute('xlink:href', newHref);
    } else {
      console.error('Image element not found');
    }
  }

  image4() {
    // Get a reference to the image element by its id
    const imageElement = document.getElementById('myImage') as HTMLImageElement;

    if (imageElement) {
      // New href value
      const newHref = '../assets/niceHouse2.jpeg';

      // Update the xlink:href attribute
      setTimeout(() => {
        imageElement.setAttribute('xlink:href', newHref);
      })
    } else {
      console.error('Image element not found');
    }
  }

  public home!: string;
  private activatedRoute = inject(ActivatedRoute);
  currentUser: UserProfile | null = null;
  constructor(public userService: UserProfileService, public gmapsService: GmapsService, private router: Router) {
    this.currentUser = this.userService.getCurrentUser();
    this.isMobile = isMobile();
  }
  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.home = this.activatedRoute.snapshot.paramMap.get('id') as string;
    const loginBut = document.getElementById('login-button');
    const signupBut = document.getElementById('signup-button');

    if (loginBut && signupBut) {
      if (this.currentUser === null) {
        loginBut.style.visibility = 'visible';
        signupBut.style.visibility = 'visible';
      }
      else {
        loginBut.style.visibility = 'hidden';
        signupBut.style.visibility = 'hidden';
      }
    }

    // let inputElementId = '';

    // if(!this.isMobile) {
    //   inputElementId = 'query';
    //   this.gmapsService.setupRegionSearchBox(inputElementId);
    // } else {
    //   inputElementId = 'query1';
    //   this.gmapsService.setupRegionSearchBox(inputElementId);
    // }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 576;
  }

  searchQuery = '';
  //to be implemented
  searchProperties() {
    // Get the search query from the input field
    if (!this.isMobile) {
      this.searchQuery = (document.getElementById("query") as HTMLInputElement).value;
    }
    else {
      this.searchQuery = (document.getElementById("query1") as HTMLInputElement).value;
    }

    // Redirect to the search page with the search query as a parameter
    this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
  }

  timeout: NodeJS.Timeout | undefined = undefined;
  async handleInputChange(event: Event) {
    this.predictionsLoading = true;
    // return;
    // const input = event.target as HTMLInputElement;
    // this.gmapsService.handleRegionInput(input, this.defaultBounds);
    // this.predictions = this.gmapsService.regionPredictions;
    // if timeout is already set, reset remaining duration
    clearTimeout(this.timeout);
    // set timeout to get predictions after 1.5 seconds
    if (this.searchQuery.length == 0) {
      this.predictions = [];
      this.predictionsLoading = false;
    }
    this.timeout = setTimeout(() => {
      const input = event.target as HTMLInputElement;

      if (input.value.length <= 0) {
        this.predictions = [];
        this.predictionsLoading = false;
      }
      else {
        this.gmapsService.getRegionPredictions(input.value).then(() => {
          this.predictions = this.gmapsService.regionPredictions;
          this.predictionsLoading = false;
        });
      }
      // clear timeout after execution
      this.timeout = undefined;
    }, 1000);
  }

  replaceInputText(event: MouseEvent | undefined, prediction: string) {
    // this.address = prediction;
    //set the text in HTML element with id=hello to predictions
    if (event) {
      event.preventDefault(); // Prevent the default behavior of the <a> tag
    }

    this.searchQuery = prediction;
    this.predictions = [];
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
function isMobile(): boolean {
  return window.innerWidth <= 576;
}