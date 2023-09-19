import { GmapsService } from '@properproperty/app/google-maps/data-access';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  HostListener, 
  ViewChildren, 
  QueryList ,
} from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { Router } from '@angular/router';
import { GetFilteredListingsRequest, Listing } from '@properproperty/api/listings/util';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Unsubscribe } from '@angular/fire/auth';
import { UserProfile } from '@properproperty/api/profile/util';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('address', { static: false }) addressInput!: ElementRef<HTMLInputElement>;
  @ViewChild('address1', { static: false }) addressInput1!: ElementRef<HTMLInputElement>;
  isMobile = true;
  MapView = true ;
  autocomplete: any;
  defaultBounds: google.maps.LatLngBounds;
  predictions: google.maps.places.AutocompletePrediction[] = [];

  @ViewChild('map', { static: false }) mapElementRef!: ElementRef;
  @ViewChild('map1', { static: false }) mapElementRef1!: ElementRef;
  @ViewChildren(IonContent) contentElements!: QueryList<IonContent>;
  
  googleMaps: any;
  // center = { lat: -25.7477, lng: 28.2433 };
  private center = { lat: 0, lng: 0 };
  private map: any;
  private mapClickListener: any;
  private markerClickListener: any;
  private markers: any[] = [];
  public listings: Listing[] = [];
  
  public activeTab = 'buying';
  public searchQuery = '';
  public env_type : string | null = null;
  public prop_type : string | null = null;
  public let_sell : string | null = null;
  public price_min : number | null = null;
  public price_max : number | null = null;
  public prop_size_min : number | null = null;
  public prop_size_max : number | null = null; 
  public bed : number | null = null;
  public showAdditionalFilters = false;
  public bath : number | null = null;
  public parking : number | null = null;
  public features: string[] = [];
  public areaScore : number | null = null;

  private profile: UserProfile | null = null;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private userProfile : UserProfile | null = null;
  private userProfileListener: Unsubscribe | null = null;

  async setCentre() {
    if (this.searchQuery == '') {
      this.center = this.listings[0] ? this.listings[0].geometry : { lat: -25.7477, lng: 28.2433 };
    } else {
      const coord = await this.gmapsService.geocodeAddress(this.searchQuery);

      if (coord) {
        this.center.lat = coord.geometry.location.lat();

        this.center.lng = coord.geometry.location.lng();
      }
    }

    // await this.loadMap();
    await this.addMarkersToMap();
  }
  constructor(
    private route: ActivatedRoute,
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private listingServices: ListingsService,
    public gmapsService: GmapsService,
    private profileServices : UserProfileService
    ) {
      this.predictions = [];
      this.defaultBounds = new google.maps.LatLngBounds();

      this.userProfile$.subscribe((profile) => {
        this.userProfile = profile;
      });
      // Update listener whenever is changes such that it can be unsubscribed from
      // when the window is unloaded
      this.userProfileListener$.subscribe((listener) => {
        this.userProfileListener = listener;
      });
      
      this.isMobile = isMobile();
      this.MapView = false;
    }

    async mapView(){
      this.MapView = !this.MapView;
      if(this.MapView &&this.isMobile){
        await this.setCentre();
      } else {
        const map1Element = document.getElementById("map1");
        if (map1Element) {
          map1Element.innerHTML = ''; // Clear the contents of the map1 div
        }
      }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
      console.log(event);
      this.isMobile = window.innerWidth <= 576;
  }
    
  async ngOnInit() {
    // await this.listingServices.getApprovedListings().then((listings) => {
    //   this.listings = listings;
    //   this.filterProperties();
    // });

    setTimeout(function () {
      // Hide the loader
      const load=document.querySelector('.loading-animation') as HTMLElement;
      const footerGap=document.querySelector('.footer-gap') as HTMLElement;
      // load.style.display="none";
      load.style.opacity="0";
      footerGap.style.display="none";

      // Display the map listing
      const maplisting=document.querySelector('#listings-and-map') as HTMLElement;
      // maplisting.style.display="block";
      maplisting.style.display="block";
    }, 2000);


    this.searchProperties();
    
  }

  // TODO add input latency to reduce api calls
  handleInputChange(event: Event): void {
    return;
    // const input = event.target as HTMLInputElement;
    // this.gmapsService.handleRegionInput(input, this.defaultBounds);
    // this.predictions = this.gmapsService.regionPredictions;
  }

  replaceInputText(event: MouseEvent | undefined, prediction: string) {
    // this.address = prediction;
    //set the text in HTML element with id=hello to predictions
    if (event) {
      event.preventDefault(); // Prevent the default behavior of the <a> tag
    }

      const addressInput = document.getElementById(this.isMobile ? "address1" : "address") as HTMLInputElement;
      if (addressInput) {
        addressInput.value = prediction;
      }
      this.predictions = [];

    }

  ngAfterViewInit() {
    
    if(!this.isMobile ||this.MapView) {
      this.setCentre();
      this.loadMap();
    }
    console.log(this.listings);

    const inputElementId = this.isMobile ? 'address1' : 'address';
    this.gmapsService.setupRegionSearchBox(inputElementId);

    const queryParams = this.route.snapshot.queryParams;
    this.searchQuery = queryParams['q'] || ''; // If 'q' parameter is not available, default to an empty string.

    const addressInput = document.getElementById(inputElementId) as HTMLInputElement;
    if (this.searchQuery!='') {
      addressInput.value = this.searchQuery;
    }
  }
async loadMap() {
  try {
  
    //const addressInput = document.getElementById("address") as HTMLInputElement;
   
    const mapElementRef1 = document.getElementById("map1") as HTMLElement;
  
    const googleMaps: any = await this.gmaps.loadGoogleMaps();
    this.googleMaps = googleMaps;
    
    let mapEl = null;
    
    if(!this.isMobile) mapEl = this.mapElementRef.nativeElement;
    else if(this.isMobile && this.MapView) mapEl = mapElementRef1;
    
      const location = new googleMaps.LatLng(this.center.lat, this.center.lng);
      this.map = new googleMaps.Map(mapEl, {
        center: location,
        zoom: 15,
        maxZoom: 18, // Set the maximum allowed zoom level
        minZoom: 5,
      });

      //this.map.fitBounds(this.gmaps.getBoundsFromLatLng(this.center.lat,this.center.lng));

      //const location = new googleMaps.LatLng(this.center.lat, this.center.lng);

      this.renderer.addClass(mapEl, 'visible');

      // Generate info window content for each listing
      const infoWindowContent = this.listings.map((listing) =>
        this.createListingCard(listing)
      );

      // Iterate over each listing
      for (let i = 0; i < this.listings.length; i++) {
        // Retrieve the longitude and latitude for the address
        const coordinates = await this.gmaps.geocodeAddress(
          this.listings[i].address
        );
        if (
          Array.isArray(coordinates) &&
          coordinates.length > 0 &&
          coordinates[0].geometry &&
          coordinates[0].geometry.location
        ) {
          const position = coordinates[0].geometry.location;

          // Create an info window for the marker
          const infoWindow = new googleMaps.InfoWindow({
            content: infoWindowContent[i],
          });

          // Create a marker without the icon
          const marker = new googleMaps.Marker({
            position: position,
            map: this.map,
            listing: this.listings[i], // Store the listing object in the marker for later use
          });

          // Add a click event listener to the marker
          googleMaps.event.addListener(marker, 'click', () => {
            infoWindow.open(this.map, marker);
            // this.navigateToPropertyListingPage(marker.listing);
          });

          this.markers.push(marker);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  addMarker(position: any, listing: Listing) {
    const googleMaps: any = this.googleMaps;
    const icon = {
      url: 'assets/icon/locationpin.png',
      scaledSize: new googleMaps.Size(40, 40), // Adjust the size of the marker icon as desired
    };
    const marker = new googleMaps.Marker({
      position: position,
      map: this.map,
      icon: icon,
      listing: listing, // Store the listing object in the marker for later use
    });

    // Create an info window for the marker
    const infoWindow = new googleMaps.InfoWindow({
      content: this.createListingCard(listing),
    });

    // Add a click event listener to the marker
    googleMaps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
      // this.navigateToPropertyListingPage(marker.listing);
    });

    // Add a click event listener to the info window
    infoWindow.addListener('domready', () => {
      const infoWindowElement = document.querySelector('.gm-style-iw');
      if (infoWindowElement) {
        infoWindowElement.addEventListener('click', () => {
          this.redirectToPage(marker.listing); // Call the navigateToPropertyListingPage function with the marker's listing object
        });
      }
    });

    this.markers.push(marker);
  }

  createListingCard(listing: Listing): string {
    return `
    <ion-card style="max-width: 250px; max-height: 300px;">
      <ion-card-header style="padding: 0;">
        <img src="${listing.photos[0]}" alt="Listing Image" style="max-width: 100%; max-height: 80px;">
      </ion-card-header>
      <ion-card-content style="padding: 0.5rem;">
        <ion-card-title style="font-size: 1rem; line-height: 1.2; margin-bottom: 0.5rem;">${listing.prop_type}</ion-card-title>
        <ion-card-subtitle style="color: #0DAE4F; font-size: 0.9rem; line-height: 1;">R ${listing.price}</ion-card-subtitle>
        <div id="house_details" style="font-size: 0.8rem; line-height: 1.2;">
          <img src="assets/icon/bedrooms.png" style="max-width: 7.5px; height: auto;">
          ${listing.bed}
          &nbsp; &nbsp;&nbsp;
          <img src="assets/icon/bathrooms.png" style="max-width: 7.5px; height: auto;">
          ${listing.bath}
          &nbsp; &nbsp;&nbsp;
          <img src="assets/icon/floorplan.png" style="max-width: 7.5px; height: auto;">
          ${listing.floor_size} m<sup>2</sup>
          &nbsp; &nbsp;&nbsp;
          <img src="assets/icon/erf.png" style="max-width: 7.5px; height: auto;">
          ${listing.property_size} m<sup>2</sup>
        </div>
      </ion-card-content>
    </ion-card>
  `;
  }

  checkAndRemoveMarker(marker: {
    position: { lat: () => any; lng: () => any };
  }) {
    const index = this.markers.findIndex(
      (x) =>
        x.position.lat() == marker.position.lat() &&
        x.position.lng() == marker.position.lng()
    );
    console.log('is marker already: ', index);
    if (index >= 0) {
      this.markers[index].setMap(null);
      this.markers.splice(index, 1);
      return;
    }
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Added Marker',
      subHeader: '',
      buttons: [
        {
          text: 'Remove',
          role: 'destructive',
          data: {
            action: 'delete',
          },
        },
        {
          text: 'Save',
          data: {
            action: 'share',
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  async redirectToPage(listing: Listing) {
    console.log(listing.listing_id);
    this.router.navigate(['/listing', { list: listing.listing_id }]);
  }

  ngOnDestroy() {
    // this.googleMaps.event.removeAllListeners();
    if (this.mapClickListener)
      this.googleMaps.event.removeListener(this.mapClickListener);
    if (this.markerClickListener)
      this.googleMaps.event.removeListener(this.markerClickListener);
  }
  //likes:
  isRed = false;

  toggleColor() {
    this.isRed = !this.isRed;
  }

  Templistings: Listing[] = [];

  async searchProperties() {
    this.listings = await this.listingServices.getApprovedListings();
    // TODO filter
    this.filterProperties();

    if(this.isMobile)this.searchQuery = (document.getElementById("address1") as HTMLInputElement).value;
    else this.searchQuery = (document.getElementById("address") as HTMLInputElement).value;

    const request = {
      env_type : this.env_type ? this.env_type : null,
      prop_type : this.prop_type ? this.prop_type : null,
      bath : this.bath ? this.bath : null,
      bed : this.bed ? this.bed : null,
      let_sell : this.let_sell ? this.let_sell : null,
      parking : this.parking ? this.parking : null,
      features : this.features.length > 0 ? this.features : null,
      property_size_min : this.prop_size_min ? this.prop_size_min : null,
      property_size_max : this.prop_size_max ? this.prop_size_max : null,
      price_min : this.price_min ? this.price_min : null,
      price_max : this.price_max ? this.price_max : null,
      areaScore : this.areaScore? this.areaScore : null
    } as GetFilteredListingsRequest

    this.listings = (await this.listingServices.getFilteredListings(request)).listings;

    // if (this.searchQuery !== '') {
    //   for (let i = 0; i < this.listings.length; i++) {
    //     try {
    //       const isInArea = await this.gmaps.checkAddressInArea(
    //         this.searchQuery,
    //         this.listings[i].geometry
    //       );
    //       if (!isInArea) {
    //         this.listings.splice(i, 1);
    //       }
    //     } catch (error) {
    //       this.listings.splice(i, 1);
    //       console.error('Error:', error);
    //     }
    //   }
    // }

    this.setCentre();
    // await this.addMarkersToMap();
  }

  async addMarkersToMap() {
    console.log(this.listings)
    for (let listing of this.listings) {
      const coordinates = listing.geometry
      if (coordinates) {
        this.addMMarker(listing);
      }
    }
  }

addMMarker(listing: Listing) {
  console.log(listing);
  const googleMaps: any = this.googleMaps;
  // const icon = {
  //   url: 'assets/icon/locationpin.png',
  //   scaledSize: new googleMaps.Size(40, 40), // Adjust the size of the marker icon as desired
  // };
  const marker = new google.maps.Marker({
    position: listing.geometry,
    map: this.map,
    title: listing.address,
  });

    // Create an info window for the marker
    const infoWindow = new googleMaps.InfoWindow({
      content: this.createListingCard(listing),
    });

    // Add a click event listener to the marker
    googleMaps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
      // this.navigateToPropertyListingPage(marker.listing);
    });

    // Add a click event listener to the info window
    infoWindow.addListener('domready', () => {
      const infoWindowElement = document.querySelector('.gm-style-iw');
      if (infoWindowElement) {
        infoWindowElement.addEventListener('click', () => {
          this.redirectToPage(listing); // Call the navigateToPropertyListingPage function with the marker's listing object
        });
      }
    });
  }

  resetFilters() {
    this.listingServices.getApprovedListings().then((listings) => {
      this.listings = listings;
    });
    this.prop_type = '';
    this.price_min = 0;
    this.price_max = 0;
    this.bed = 0;
    this.bath = 0;
    this.parking = 0;

  this.features= [];
}


// activeTab = 'all';
// searchQuery = '';
// selectedPropertyType = '';
// selectedMinPrice = 0;
// selectedMaxPrice = 0;
// selectedBedrooms = 0;
// showAdditionalFilters = false;
// selectedBathrooms = 0;
// selectedParking = 0;
// selectedAmenities: string[] = [];

// properties: Property[] = [
//   { title: 'House 1', type: 'house', price: 100000, bedrooms: 3 },
//   { title: 'Apartment 1', type: 'apartment', price: 1500, bedrooms: 2 },
//   { title: 'Condo 1', type: 'condo', price: 2000, bedrooms: 1 },
//   // Add more properties here
// ];

  get filteredBuyingProperties(): Listing[] {
    const filteredListings: Listing[] = [];
    for (let listing of this.listings) {
      if (listing.let_sell == 'Sell') {
        filteredListings.push(listing)
      }
    }

    return filteredListings;
  }

  get filteredRentingProperties(): Listing[] {
    const filteredListings: Listing[] = [];
    for (let listing of this.listings) {
      if (listing.let_sell == 'Rent') {
        filteredListings.push(listing)
      }
    }


    return filteredListings;
  }

filterProperties(): void {

  // Update the filtered properties based on the selected filters and search query
  if (this.activeTab === 'buying') {
    console.log("Buying");
    this.listings = this.filteredBuyingProperties;

  } else if (this.activeTab === 'renting') {
    console.log("Renting");
    this.listings = this.filteredRentingProperties;
  }
}

  changeTab(): void {
    // Reset the selected filters and search query when changing tabs
    this.prop_type = '';
    this.price_min = 0;
    this.price_max = 0;
    this.bed = 0;
    this.searchQuery = '';
    this.features = [];
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
    return this.features.includes(amenity);
  }

  updateSelectedAmenities(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(target.options)
      .filter((option: HTMLOptionElement) => option.selected)
      .map((option: HTMLOptionElement) => option.value);

    this.features = selectedOptions;
  }

  toggleSelection(amenity: string): void {
    const index = this.features.indexOf(amenity);
    if (index > -1) {
      this.features.splice(index, 1);
    } else {
      this.features.push(amenity);
    }
  }

  //Save listing
  isSaved(listing_id: string) {
    if (this.profile) {
      if (this.profile.savedListings) {
        if (this.profile.savedListings.includes(listing_id)) {
          return true;
        }
      }
    }

    return false;
  }

  saveListing($event: any, listing_id: string) {
    if (listing_id != '') {
      const heartBut = $event.target as HTMLButtonElement;
      heartBut.style.color = 'red';

      if (this.profile) {
        if (this.profile.savedListings) {
          this.profile.savedListings.push(listing_id);
        } else {
          this.profile.savedListings = [listing_id];
        }

        this.profileServices.updateUserProfile(this.profile);
      }
    }
  }

  unsaveListing($event: any, listing_id: string) {
    if (listing_id != '') {
      const heartBut = $event.target as HTMLButtonElement;
      heartBut.style.color = 'red';

      if (this.profile) {
        if (this.profile.savedListings) {
          this.profile.savedListings.splice(
            this.profile.savedListings.indexOf(listing_id),
            1
          );
        }

      if(this.userProfile){
        this.profileServices.updateUserProfile(this.userProfile);
      }
    }
  } 
}
clicked = false;
dropDown(){

  const sec = document.getElementById("sandf") as HTMLInputElement;
  const sec2 = document.getElementById("iconic") as HTMLInputElement;

  if (sec && !this.clicked) {
    sec.classList.toggle("show");
    if(sec2)
    {
      sec2.name = "chevron-up-outline";
    }
    
    this.clicked=true;
  }
  else
  {
    sec.classList.remove("show");
    if(sec2)
    {
      sec2.name = "chevron-down-outline";
    }

    this.clicked=false;
  }

}

status=true;


async centerMap(listing : Listing)
{
  
    this.listingServices.getListings().then(async (listings) => {
    this.filterProperties();

    this.searchQuery = listing.address;
    this.setCentre();

  });

  await this.addOneMarkersToMap(listing) ;
 
}

async addOneMarkersToMap(listing : Listing) {
  
  const coordinates = await this.gmapsService.geocodeAddress(listing.address);
  if (coordinates) {
    console.log("my coordinates ",coordinates);
    this.addMarker(coordinates, listing);
    
  }
}
}

function isMobile(): boolean {
  return window.innerWidth <= 576;
}


