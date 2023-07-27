import { Component, Inject, OnInit,ViewChild,ElementRef ,HostListener, inject} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import Swiper from 'swiper';

import { AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { ListingsService } from '@properproperty/app/listing/data-access';

import { Listing } from '@properproperty/api/listings/util';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs'
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';


interface Property {
  title: string;
  type: string;
  price: number;
  bedrooms: number;
}
declare const gtag: Function;
// import { Storage, ref } from '@angular/fire/storage';
// import { uploadBytes } from 'firebase/storage';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  isMobile: boolean;
  @ViewChild('address', { static: true }) addressInput!: ElementRef<HTMLInputElement>;

  autocomplete: any;
  defaultBounds: google.maps.LatLngBounds;
  predictions: google.maps.places.AutocompletePrediction[] = [];


  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  swiperSlideChanged(e:Event) {
    console.log('changed', e)
  }

  googleMaps: any;
  listings: Listing[] = [];

  public home!: string;
  private activatedRoute = inject(ActivatedRoute);
 
  constructor(

    private gmaps: GmapsService,
    private renderer: Renderer2,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private listingServices : ListingsService,
    public gmapsService: GmapsService,
    @Inject(DOCUMENT) private document: Document) {
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

      this.selectedPropertyType = 'Proper Property';
      this.defaultBounds = new google.maps.LatLngBounds();

      console.log("indeed ",this.isMobile);

      this.predictions = [];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 576;
  }

   async ngOnInit() {

    this.home = this.activatedRoute.snapshot.paramMap.get('id') as string;
    const loginBut = document.getElementById('login-button');
    const signupBut = document.getElementById('signup-button');

    await this.listingServices.getApprovedListings().then((listings) => {
      this.listings = listings;
      this.filterProperties();
    });

    console.log(this.listings);

    
    const inputElementId = 'address';

    
    
    this.gmapsService.setupRegionSearchBox(inputElementId);
  
  
  }

  searchQuery = '';
  //to be implemented
  searchProperties() {
    this.searchQuery = (document.getElementById("address") as HTMLInputElement).value;
  }

  handleInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.gmapsService.handleRegionInput(input, this.defaultBounds);
    this.predictions = this.gmapsService.regionPredictions;
  }

  replaceInputText(event: MouseEvent | undefined,prediction: string) {
    // this.address = prediction;
    //set the text in HTML element with id=hello to predictions
    if (event) {
      event.preventDefault(); // Prevent the default behavior of the <a> tag
    }

    const addressInput = document.getElementById("address") as HTMLInputElement;
    if (addressInput) {
      addressInput.value = prediction;
    }
    this.predictions = [];
  }

  navigateToPropertyListingPage(listing: Listing) {

    console.log(listing.listing_id);
    this.router.navigate(['/listing', {list: listing.listing_id}]);
  }

  async redirectToPage(listing: Listing) {
    console.log(listing.listing_id);
    this.router.navigate(['/listing', {list : listing.listing_id}]);
  }

  isRed = false;

toggleColor() {
  this.isRed = !this.isRed;
}

Templistings: Listing[] = [];

async MobileSearchProperties() {
  // const filteredListings = this.listings.filter(listing => {
  //   const addressMatch = listing.address.toLowerCase().includes(this.searchQuery.toLowerCase());
  //   const bedroomsMatch = this.selectedBedrooms === 0 || listing.bed === this.selectedBedrooms.toString();
  //   const floorMatch = this.selectedFloorSize === 0 || parseInt(listing.floor_size) >= this.selectedFloorSize;
  //   const minPriceMatch = this.selectedMinPrice === 0 || parseInt(listing.price) >= this.selectedMinPrice;
  //   const maxPriceMatch = this.selectedMaxPrice === 0 || parseInt(listing.price) <= this.selectedMaxPrice;
  //   const propertyTypeMatch = this.selectedPropertyType === '' || listing.prop_type.includes(this.selectedPropertyType);

  //   return addressMatch && bedroomsMatch && floorMatch && minPriceMatch && maxPriceMatch && propertyTypeMatch;
  // });

  // this.listings = filteredListings;

  // this.listingServices.getApprovedListings().then((listings) => {
  //   this.listings = listings;
  //   this.filterProperties();

    
  // });

  this.listingServices.getApprovedListings().then(async (listings) => {
    this.listings = listings;
    this.filterProperties();

    this.searchQuery = (document.getElementById("address") as HTMLInputElement).value;
   
  
    // this.center.lat = (await this.gmaps.getLatLongFromAddress(this.searchQuery)).latitude;
    // console.log("beach");
    // this.center.lng =  (await this.gmaps.getLatLongFromAddress(this.searchQuery)).longitude;



    for(let k = 0; k<this.listings.length; k++) {
      
      this.listings[k].price = this.listings[k].price.replace(/,/g, '');
      
    }
  
    for (let i = 0; i < this.listings.length; i++) {
      if (this.searchQuery !== '') {
        try {
          const isInArea = await this.gmaps.checkAddressInArea(this.searchQuery, this.listings[i].address);
          if (!isInArea) {
            this.listings.splice(i, 1);
            console.log('Address 1 is not in the area of Address 2', i);
          } else {
            console.log('Address 1 is in the area of Address 2', i);
            console.log(this.listings[i].address, "eyy");
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    }
  
  for (let j = 0; j < this.listings.length; j++) {
    
    for (let i = 0; i < this.listings.length; i++) {
  
      if(this.selectedPropertyType!=''){
        if(this.listings[i].prop_type!=this.selectedPropertyType){
          this.listings.splice(i,1);
        }
      }
      
      if(this.selectedBedrooms!=0){
  
        if(parseInt(this.listings[i].bed)!=this.selectedBedrooms){
          this.listings.splice(i,1);
        }
      }
      
      if(this.selectedBathrooms!=0){
    
        if(parseInt(this.listings[i].bath)!=this.selectedBathrooms){
          this.listings.splice(i,1);
        }
      }
  
      if(this.selectedMinPrice!=0){
  
        if (parseInt(this.listings[i].price) < this.selectedMinPrice){
          this.listings.splice(i,1);
        }
      }
  
  
      if(this.selectedMaxPrice!=0){
  
        if (parseInt(this.listings[i].price) > this.selectedMaxPrice){
          this.listings.splice(i,1);
        }
      }
  
      if(this.selectedParking!=0){
          
          if((parseInt(this.listings[i].parking)!=this.selectedParking) && (parseInt(this.listings[i].parking)<5)){
            this.listings.splice(i,1);
          }
          else if ((parseInt(this.listings[i].parking)>=5) && (this.selectedParking != 5)) {
            this.listings.splice(i,1);
          }
      }
      
      //checkAddressinArea(searchQuery, house address);
  
    // this.gmaps.checkAddressInArea(this.searchQuery,"14 Umhlanga Rocks Dr, Umhlanga, uMhlanga, 4320, South Africa")
    // .then((isInArea) => {
    //   if (isInArea) {
    //     console.log('hillcrest is in umhlanga');
    //     console.log(this.listings[i].address,"eyy");
    //   } else {
    //     console.log('Address 1 is not in the area of Address 2');
    //   }
    // })
    // .catch((error) => {
    //   console.error('Error:', error);
    // });
      
    this.listings[i].price = this.listings[i].price.replace(/,/g, '');
    
    // Format the price with commas
    this.listings[i].price = this.listings[i].price.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  
    }
  }
  
  });

  
}


resetFilters() {
  this.listingServices.getApprovedListings().then((listings) => {
    this.listings = listings;
  });
  this.selectedPropertyType = '';
  this.selectedMinPrice = 0;
  this.selectedMaxPrice = 0;
  this.selectedBedrooms = 0;
  this.selectedBathrooms = 0;
  this.selectedParking = 0;

  this.selectedAmenities= [];
}


activeTab = 'buying';

selectedPropertyType = '';
selectedMinPrice = 0;
selectedMaxPrice = 0;
selectedBedrooms = 0;
showAdditionalFilters = false;
selectedBathrooms = 0;
selectedParking = 0;
selectedAmenities: string[] = [];


get filteredBuyingProperties(): Listing[] {
  this.listingServices.getApprovedListings().then((listings) => {
    this.listings = listings;

    for(let j = 0; j< this.listings.length;j++) {
      for(let i = 0; i < this.listings.length; i++) {
        if(this.listings[i].let_sell!="Sell"){
          this.listings.splice(i,1);
        }
      }
    }

  });

  return this.listings;
}

get filteredRentingProperties(): Listing[] {

  this.listingServices.getApprovedListings().then((listings) => {
    this.listings = listings;

    for(let j = 0; j< this.listings.length;j++) {
    
      for(let i = 0; i < this.listings.length; i++) {
        if(this.listings[i].let_sell!="Rent"){
          this.listings.splice(i,1);
        }
      }
    }
  
  });
    

  return this.listings;
}

filterProperties(): void {

  // Update the filtered properties based on the selected filters and search query
  if (this.activeTab === 'buying') {

    this.listings = this.filteredBuyingProperties;

  } else if (this.activeTab === 'renting') {

    this.listings = this.filteredRentingProperties;
  }
}

changeTab(): void {
  // Reset the selected filters and search query when changing tabs
  this.selectedPropertyType = '';
  this.selectedMinPrice = 0;
  this.selectedMaxPrice = 0;
  this.selectedBedrooms = 0;
  this.searchQuery = '';
  this.selectedAmenities = [];
  this.filterProperties();
}


toggleAdditionalFilters(): void {
  this.showAdditionalFilters = !this.showAdditionalFilters;
  this.filterProperties();
}

amenities = [
  { value: 'petFriendly', label: 'Pet Friendly' },
  { value: 'garden', label: 'Garden' },
  { value: 'pool', label: 'Pool' },
  { value: 'flatlet', label: 'Flatlet' },
  { value: 'securityEstate', label: 'Security Estate' },
  { value: 'auction', label: 'Auction' },
  // Add more amenities as needed
];

isSelected(amenity: string): boolean {
  return this.selectedAmenities.includes(amenity);
}

updateSelectedAmenities(event: Event): void {
  const target = event.target as HTMLSelectElement;
  const selectedOptions = Array.from(target.options)
    .filter((option: HTMLOptionElement) => option.selected)
    .map((option: HTMLOptionElement) => option.value);

  this.selectedAmenities = selectedOptions;
}

toggleSelection(amenity: string): void {
  const index = this.selectedAmenities.indexOf(amenity);
  if (index > -1) {
    this.selectedAmenities.splice(index, 1);
  } else {
    this.selectedAmenities.push(amenity);
  }
}



}
