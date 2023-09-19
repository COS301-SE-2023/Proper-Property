import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild,HostListener, ViewChildren, QueryList  } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { Router } from '@angular/router';
import { Listing } from '@properproperty/api/listings/util';
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
  center = { lat: 0, lng: 0 };
  map: any;
  mapClickListener: any;
  markerClickListener: any;
  markers: any[] = [];
  listings: Listing[] = [];

  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private userProfile : UserProfile | null = null;
  private userProfileListener: Unsubscribe | null = null;


  async setCentre(){


    if(this.searchQuery==""){
      
      this.center = { lat: -25.7477, lng: 28.2433 };
    }
    else {
   
      const coord = await this.gmapsService.geocodeAddress(this.searchQuery);

      if (coord) {
        this.center.lat = coord.geometry.location.lat();

        this.center.lng = coord.geometry.location.lng();
        
      }
    }
    
   await this.loadMap();
   await this.addMarkersToMap();

  }
  constructor(
    private route: ActivatedRoute,
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private listingServices : ListingsService,
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

    await this.listingServices.getApprovedListings().then((listings) => {
      this.listings = listings;
      this.filterProperties();
    });

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

    console.log(this.listings);

    if(!this.isMobile){
      const inputElementId = 'address';

    
    
      this.gmapsService.setupRegionSearchBox(inputElementId);
  
      const queryParams = this.route.snapshot.queryParams;
      this.searchQuery = queryParams['q'] || ''; // If 'q' parameter is not available, default to an empty string.
  
      const addressInput = document.getElementById("address") as HTMLInputElement;
      if (this.searchQuery!='') {
        addressInput.value = this.searchQuery;
      }
  
      this.searchProperties();
    }

    else {
      const inputElementId = 'address1';

    
    
      this.gmapsService.setupRegionSearchBox(inputElementId);
  
      const queryParams = this.route.snapshot.queryParams;
      this.searchQuery = queryParams['q'] || ''; // If 'q' parameter is not available, default to an empty string.
  
      const addressInput = document.getElementById("address1") as HTMLInputElement;
      if (this.searchQuery!='') {
        addressInput.value = this.searchQuery;
      }
  
      this.searchProperties();
    }


    
    
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

    if(!this.isMobile){
      const addressInput = document.getElementById("address") as HTMLInputElement;
      if (addressInput) {
        addressInput.value = prediction;
      }
      this.predictions = [];
    }
    else {
      const addressInput = document.getElementById("address1") as HTMLInputElement;
      if (addressInput) {
        addressInput.value = prediction;
      }
      this.predictions = [];
    }
  }



  ngAfterViewInit() {
    if(!this.isMobile ||this.MapView) {
      this.setCentre();
      this.loadMap();
    }

  }



// async loadMap() {
//   try {
//     const googleMaps: any = await this.gmaps.loadGoogleMaps();
//     this.googleMaps = googleMaps;
//     const mapEl = this.mapElementRef.nativeElement;
//     const location = new googleMaps.LatLng(this.center.lat, this.center.lng);
//     this.map = new googleMaps.Map(mapEl, {
//       center: location,
//       zoom: 12,
//     });
//     this.renderer.addClass(mapEl, 'visible');

//     // Generate info window content for each listing
//     const infoWindowContent = this.listings.map((listing) => this.createListingCard(listing));

//     // Iterate over each listing
//     for (let i = 0; i < this.listings.length; i++) {
//       // Retrieve the longitude and latitude for the address
//       const coordinates = await this.gmaps.geocodeAddress(this.listings[i].address);
//       if (
//         Array.isArray(coordinates) &&
//         coordinates.length > 0 &&
//         coordinates[0].geometry &&
//         coordinates[0].geometry.location
//       ) {
//         const position = coordinates[0].geometry.location;

//         // Create an info window for the marker
//         const infoWindow = new googleMaps.InfoWindow({
//           content: infoWindowContent[i],
//         });

//         // Create a marker without the icon
//         const marker = new googleMaps.Marker({
//           position: position,
//           map: this.map,
//           listing: this.listings[i], // Store the listing object in the marker for later use
//         });

//         // Add a click event listener to the marker
//         googleMaps.event.addListener(marker, 'click', () => {
//           infoWindow.open(this.map, marker);
//           this.navigateToPropertyListingPage(marker.listing);
//         });

//         this.markers.push(marker);
//       }
//     }

//     this.onMapClick();
//   } catch (e) {
//     console.log(e);
//   }
// }

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
    const infoWindowContent = this.listings.map((listing) => this.createListingCard(listing));

    // Iterate over each listing
    for (let i = 0; i < this.listings.length; i++) {
      // Retrieve the longitude and latitude for the address
      const coordinates = await this.gmaps.geocodeAddress(this.listings[i].address);
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
          this.navigateToPropertyListingPage(marker.listing); // Call the navigateToPropertyListingPage function with the marker's listing object
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





navigateToPropertyListingPage(listing: Listing) {

  console.log(listing.listing_id);
  this.router.navigate(['/listing', {list: listing.listing_id}]);
}

checkAndRemoveMarker(marker: { position: { lat: () => any; lng: () => any; }; }) {
  const index = this.markers.findIndex(x => x.position.lat() == marker.position.lat() && x.position.lng() == marker.position.lng());
  console.log('is marker already: ', index);
  if(index >= 0) {
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
    this.router.navigate(['/listing', {list : listing.listing_id}]);
  }

ngOnDestroy() {
  // this.googleMaps.event.removeAllListeners();
  if(this.mapClickListener) this.googleMaps.event.removeListener(this.mapClickListener);
  if(this.markerClickListener) this.googleMaps.event.removeListener(this.markerClickListener);
}
//likes:
isRed = false;

toggleColor() {
  this.isRed = !this.isRed;
}

  Templistings: Listing[] = []

  async searchProperties() {
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

  this.showAdditionalFilters = false;

  this.listingServices.getApprovedListings().then(async (listings) => {
    this.listings = listings;
    this.filterProperties();

    if(this.isMobile)this.searchQuery = (document.getElementById("address1") as HTMLInputElement).value;
    else this.searchQuery = (document.getElementById("address") as HTMLInputElement).value;
   
    this.setCentre();
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
      
          }
        } catch (error) {
          this.listings.splice(i, 1);
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

  await this.addMarkersToMap() ;

  
}

async addMarkersToMap() {
  for (let i = 0; i < this.listings.length; i++) {
    const coordinates = await this.gmapsService.geocodeAddress(this.listings[i].address);
    if (coordinates) {
      console.log("my coordinates ",coordinates);
      this.addMMarker(coordinates, this.listings[i]);
      
    }
  }
}




addMMarker(coordinates: google.maps.GeocoderResult, listing: any) {

  const googleMaps: any = this.googleMaps;
  // const icon = {
  //   url: 'assets/icon/locationpin.png',
  //   scaledSize: new googleMaps.Size(40, 40), // Adjust the size of the marker icon as desired
  // };
  const marker = new google.maps.Marker({
    position: coordinates.geometry.location,
    map: this.map,
    title: listing.title,
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
          this.navigateToPropertyListingPage(listing); // Call the navigateToPropertyListingPage function with the marker's listing object
        });
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
searchQuery = '';
selectedPropertyType = '';
selectedMinPrice = 0;
selectedMaxPrice = 0;
selectedBedrooms = 0;
showAdditionalFilters = false;
selectedBathrooms = 0;
selectedParking = 0;
selectedAmenities: string[] = [];

// properties: Property[] = [
//   { title: 'House 1', type: 'house', price: 100000, bedrooms: 3 },
//   { title: 'Apartment 1', type: 'apartment', price: 1500, bedrooms: 2 },
//   { title: 'Condo 1', type: 'condo', price: 2000, bedrooms: 1 },
//   // Add more properties here
// ];



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

//Save listing
isSaved(listing_id : string){
  if(this.userProfile){
    if(this.userProfile.savedListings){
      if(this.userProfile.savedListings.includes(listing_id)){
        return true;
      }
    }
  }

  return false;
}

saveListing($event : any, listing_id : string) {
  if(listing_id != ''){
    const heartBut = $event.target as HTMLButtonElement;
    heartBut.style.color = "red";
    
    if(this.userProfile){
        if(this.userProfile.savedListings){
          this.userProfile.savedListings.push(listing_id);
        }
        else{
          this.userProfile.savedListings = [listing_id];
        }

        this.profileServices.updateUserProfile(this.userProfile);
    }
  } 
}

unsaveListing($event : any, listing_id : string){
  if(listing_id != ''){
    const heartBut = $event.target as HTMLButtonElement;
    heartBut.style.color = "red";
    
    if(this.userProfile){
        if(this.userProfile.savedListings){
          this.userProfile.savedListings.splice(this.userProfile.savedListings.indexOf(listing_id), 1);
        }

        this.profileServices.updateUserProfile(this.userProfile);
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

onChange()
{
  const tog1 = document.getElementById("lists") as HTMLInputElement;
  const tog2 = document.getElementById("lists2") as HTMLInputElement;

  if(this.status)
  {
    if(tog1 && tog2)
    {
      tog1.style.display= 'block';
      tog2.style.display = 'none';
    }
  }
  else
  {
    if(tog1 && tog2)
    {
      tog1.style.display= 'none';
      tog2.style.display = 'block';
    }
  }

}
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

