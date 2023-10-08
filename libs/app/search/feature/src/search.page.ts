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
import { 
  ActionSheetController, 
  IonContent
} from '@ionic/angular';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { Router } from '@angular/router';
import { GetFilteredListingsRequest, Listing, areaScore } from '@properproperty/api/listings/util';
import { Recommend } from '@properproperty/api/listings/util';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Unsubscribe} from '@angular/fire/auth';
import { UserProfile } from '@properproperty/api/profile/util';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
// import { IonContent } from '@ionic/angular';

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
  // defaultBounds: google.maps.LatLngBounds;
  predictions: google.maps.places.AutocompletePrediction[] = [];

  @ViewChild('map', { static: false }) mapElementRef!: ElementRef;
  @ViewChild('map1', { static: false }) mapElementRef1!: ElementRef;
  @ViewChildren(IonContent) contentElements!: QueryList<IonContent>;
  
  googleMaps: any;
  // center = { lat: -25.7477, lng: 28.2433 };
  private center = { lat: -25.7477, lng: 28.2433 };
  private map: any;
  private mapClickListener: any;
  private markerClickListener: any;
  private markers: any[] = [];
  public listings: Listing[] = [];
  public allListings: Listing[] = [];
  
  public activeTab = 'all';
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
  public areaScore : Partial<areaScore> = {};
  public totalAreaScore : number | null = null;
  public property_size_values: {lower: number, upper: number} = {lower: 0, upper: 99999999};
  public property_price_values: {lower: number, upper: number} = {lower: 0, upper: 99999999};
  private profile: UserProfile | null = null;  
  public recommends: Recommend[]=[];
  userInterestVector: number[]=[];
  recommendationMinimum = 100000;



  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private userProfile : UserProfile | null = null;
  private userProfileListener: Unsubscribe | null = null;

  async setCentre(coordinates?: google.maps.LatLngLiteral) {
    if(coordinates){
      this.center = coordinates;
    }
    else if (!this.searchQuery && this.listings.length > 0) {
      const geoSum = {
        lat: 0,
        lng: 0
      };
      for (const listing of this.listings) {
        geoSum.lat += listing.geometry.lat;
        geoSum.lng += listing.geometry.lng;
      }
      geoSum.lat = geoSum.lat/this.listings.length;
      geoSum.lng = geoSum.lng/this.listings.length;

      this.center = geoSum;
    }
    else if (this.searchQuery) {
      const coord = await this.gmapsService.geocodeAddress(this.searchQuery);
      if (coord) {
        this.center.lat = coord.geometry.location.lat();

        this.center.lng = coord.geometry.location.lng();
      }
    }

    if (this.map) {
      this.map.setCenter(new this.googleMaps.LatLng(this.center.lat ?? -25.7477, this.center.lng ?? 28.2433));
    }
    
    // await this.loadMap();
  }
  constructor(
    private route: ActivatedRoute,
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private listingServices: ListingsService,
    public gmapsService: GmapsService,
    private profileServices : UserProfileService,
    private toastController: ToastController
    ) {
      this.predictions = [];
      // this.defaultBounds = new google.maps.LatLngBounds();
      

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
    onResize() {
      this.isMobile = window.innerWidth <= 576;
  }
    
  predictionDisplay() {
    return this.predictions.length > 0;
  }
  async ngOnInit() {
 
    // await this.listingServices.getApprovedListings().then((listings) => {
    //   this.listings = listings;
    //   this.filterProperties();
    // });
    setTimeout(function () {
      // Hide the loader
      const load=document.querySelector('.loading-animation') as HTMLElement;
      // load.style.display="none";
      load.style.display="none";
      // const footerGap=document.querySelector('.footer-gap') as HTMLElement;
      // footerGap.style.display="none";

      // Display the map listing
      const maplisting=document.querySelector('.show') as HTMLElement;
      // maplisting.style.display="block";
      maplisting.style.opacity="1";
    }, 2000);


  }

  // TODO add input latency to reduce api calls
  timeout: NodeJS.Timeout | undefined = undefined;
  searchLoading = false;
  async handleInputChange(event: Event) {
    // return;
    // const input = event.target as HTMLInputElement;
    // this.gmapsService.handleRegionInput(input, this.defaultBounds);
    // this.predictions = this.gmapsService.regionPredictions;
    // if timeout is already set, reset remaining duration
    clearTimeout(this.timeout);
    if (this.searchQuery.length == 0) {
      this.searchLoading = false;
      this.predictions = [];
      return;
    }
    // set timeout to get predictions after 1.5 seconds
    this.searchLoading = true;
    this.timeout = setTimeout(() => {
      const input = event.target as HTMLInputElement;
 
      if(input.value.length <=0){
        this.predictions = [];
      }
      else {
        this.gmapsService.getRegionPredictions(input.value).then(() => {
          this.predictions = this.gmapsService.regionPredictions;
          this.searchLoading = false;
        });
      }
      // clear timeout after execution
      this.timeout = undefined;
    }, 1000);
  }
  getRecommendation(ID: string|undefined)
  {
    if (!ID) return false;
    
    for(const list of this.recommends)
    {
      if(list.listingID==ID)
      {
        return list.recommended;
      }
    }

    return false;
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

    const inputElementId = this.isMobile ? 'address1' : 'address';
    // this.gmapsService.setupRegionSearchBox(inputElementId);

    const queryParams = this.route.snapshot.queryParams;
    this.searchQuery = queryParams['q'] || ''; // If 'q' parameter is not available, default to an empty string.

    const addressInput = document.getElementById(inputElementId) as HTMLInputElement;
    if (this.searchQuery!='') {
      addressInput.value = this.searchQuery;
    }
    // this.listings = await this.listingServices.getApprovedListings();
    // this.allListings = this.listings;
    // await this.addMarkersToMap();
    // this.filterProperties();
    this.searchProperties();
    // this.addMarkersToMap();
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
      const location = new googleMaps.LatLng(this.center.lat ?? -25.7477, this.center.lng ?? 28.2433);
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
      // this.listings.map((listing) =>
      //   this.createListingCard(listing)
      // );

      for(const listing of this.listings){
        this.createListingCard(listing);
      }
      
      // Iterate over each listing
      for (let i = 0; i < this.listings.length; i++) {
        if (this.listings[i].geometry.lat && this.listings[i].geometry.lng ) {
          const position = this.listings[i].geometry;
          this.addMarker(position, this.listings[i])
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
      const infoWindowElement = document.querySelector('.marker-card');
      const dumbButton = document.querySelector('.gm-ui-hover-effect');
      if (dumbButton) {
        dumbButton.addEventListener('click', (event: Event) => {
          event.stopPropagation();
          // infoWindow.close();
        });
        return;
      }
      if (infoWindowElement) {
        infoWindowElement.addEventListener('click', (event: Event) => {
          event.stopPropagation();
          this.mapMarkerClicked(event,infoWindowElement.getAttribute( "data-id") ?? ""); // Call the navigateToPropertyListingPage function with the marker's listing object
        });
      }
    });

    this.markers.push(marker);
  }
  mapMarkerClicked(event: Event, listingId?: string) {
    event.stopPropagation();
    if (listingId) {
      this.router.navigate(['/listing', { list: listingId }]);
    }
  }
  createListingCard(listing: Listing): any {
    return `
    <ion-card data-id="${listing.listing_id}"class="marker-card" style="max-width: 250px; max-height: 300px;" (click)="mapMarkerClicked($event, ${listing.listing_id})">
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
    // this.listings = await this.listingServices.getApprovedListings();

    if(this.isMobile)this.searchQuery = (document.getElementById("address1") as HTMLInputElement).value;
    else this.searchQuery = (document.getElementById("address") as HTMLInputElement).value;

    const request = {
      env_type : this.env_type ? this.env_type : null,
      prop_type : this.prop_type ? this.prop_type : null,
      bath : this.bath ? this.bath : null,
      bed : this.bed ? this.bed : null,
      parking : this.parking ? this.parking : null,
      features : this.features.length > 0 ? this.features : null,
      property_size_min : this.property_size_values.lower ? this.property_size_values.lower : null,
      property_size_max : this.property_size_values.upper ? this.property_size_values.upper : null,
      price_min : this.property_price_values.lower ? this.property_price_values.lower : null,
      price_max : this.property_price_values.upper ? this.property_price_values.upper : null,
      areaScore : this.areaScore? this.areaScore : null,
      totalAreaScore : this.totalAreaScore? this.totalAreaScore : null
    } as GetFilteredListingsRequest
    const response = (await this.listingServices.getFilteredListings(request));
    this.allListings = [];


    // TODO filter
    if(!response.listings.length){
      const toast = await this.toastController.create({
        message: 'No listings returned',
        duration: 3000, // Duration in milliseconds
        color: 'danger', // Use 'danger' to display in red
        position: 'bottom' // Position of the toast: 'top', 'middle', 'bottom'
      });
      toast.present();
      return;
    }
      
    const areaBounds = this.searchQuery?  await this.gmapsService.geocodeAddress(this.searchQuery) : null;
    if (areaBounds) {
      for(const listing of response.listings){
        const isInArea = await this.gmapsService.checkAddressInArea(areaBounds.geometry.viewport, listing.geometry)
        if(isInArea){
          this.allListings.push(listing);
        }
      }
    } else {
      this.allListings = response.listings;
    }
    if(this.allListings){
      //Recommendation algo
      if(this.userProfile)
      {
        this.userInterestVector = this.profileServices.getInterestArray(this.userProfile);
      }

      for(const list of response.listings)
      {
        if (window.location.hostname.includes("localhost"))
          console.log(list.characteristics);
        this.recommends.push({
          listingID: list.listing_id,
          recommended: await this.listingServices.recommender(
            list.characteristics, 
            this.userInterestVector
            )
          })
      }
      
      if (window.location.hostname.includes("localhost"))
        console.warn(this.recommends);

      this.filterProperties();
      await this.loadMap();
      await this.addMarkersToMap();
      await this.setCentre();
      // await this.addMarkersToMap();
    }
  }

  async addMarkersToMap() {
    for (const listing of this.listings) {
      const coordinates = listing.geometry
      if (coordinates) {
        this.addMMarker(listing);
      }
    }
  }

addMMarker(listing: Listing) {
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

    infoWindow.addListener('domready', () => {
      const infoWindowElement = document.querySelector('.marker-card');
      if (infoWindowElement) {
        infoWindowElement.addEventListener('click', (event: Event) => {
          event.stopPropagation();
          // if (event.target != event.currentTarget) {
          //   return;
          // }
          this.mapMarkerClicked(event,infoWindowElement.getAttribute( "data-id") ?? ""); // Call the navigateToPropertyListingPage function with the marker's listing object
        });
      }
    });
  }

  resetFilters() {
    this.prop_type = null;
    this.env_type = null;
    this.let_sell = null;
    this.price_min = null;
    this.price_max = null;
    this.property_size_values.lower = 0;
    this.property_size_values.upper = 999999999;
    this.property_price_values.lower = 0;
    this.property_price_values.upper = 99999999;
    this.areaScore = {};
    this.totalAreaScore = null;
    this.bed = null;
    this.bath = null;
    this.parking = null;
    this.features = [];

    this.searchProperties();
}

  get filteredBuyingProperties(): Listing[] {
    const filteredListings: Listing[] = [];
    for (const listing of this.allListings) {
      if (listing.let_sell == 'Sell') {
        filteredListings.push(listing)
      }
    }

    return filteredListings;
  }

  get filteredRentingProperties(): Listing[] {
    const filteredListings: Listing[] = [];
    for (const listing of this.allListings) {
      if (listing.let_sell == 'Rent') {
        filteredListings.push(listing)
      }
    }


    return filteredListings;
  }

filterProperties(): void {

  // Update the filtered properties based on the selected filters and search query
  if (this.activeTab === 'buying') {
    this.listings = this.filteredBuyingProperties;

  } else if (this.activeTab === 'renting') {
    this.listings = this.filteredRentingProperties;
  }
  else if(this.activeTab === "all"){
    this.listings = this.allListings;
  }
}



selectedSortOption = 'default';

sortListings() {


  switch (this.selectedSortOption) {
      case 'priceLowToHigh':
          this.listings.sort((a, b) => Number(a.price) - Number(b.price));
          break;
      case 'priceHighToLow':
          this.listings.sort((a, b) => Number(b.price) - Number(a.price));
          break;
      case 'propertyType':
          this.listings.sort((a, b) => a.prop_type.localeCompare(b.prop_type));
          break;
      case 'size':
          this.listings.sort((a, b) => Number(a.floor_size) - Number(b.floor_size));
          break;
      default:
          // Default sort logic here, if any
          break;
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
    // this.filterProperties();
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

  status=false;


  async centerMap(listing : Listing)
  {
    this.setCentre(listing.geometry);
  }

  onPriceKnobMoveStart(){
    const priceSlider = document.getElementById("priceSlider") as any;
    if(priceSlider){
      this.price_min = parseInt(priceSlider.value.lower);
      this.price_max = parseInt(priceSlider.value.upper);
    }
  }

  onPropSizeKnobMoveStart(){
    const propSizeSlider = document.getElementById("propSizeSlider") as any;
    if(propSizeSlider){
      this.prop_size_min = parseInt(propSizeSlider.value.lower);
      this.prop_size_max = parseInt(propSizeSlider.value.upper);
    }
  }
}


function isMobile(): boolean {
  return window.innerWidth <= 576;
}