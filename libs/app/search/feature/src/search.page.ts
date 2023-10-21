import { GmapsService } from '@properproperty/app/google-maps/data-access';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
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
export class SearchPage implements OnDestroy, AfterViewInit {
  @ViewChild('address', { static: false }) addressInput!: ElementRef<HTMLInputElement>;
  @ViewChild('address1', { static: false }) addressInput1!: ElementRef<HTMLInputElement>;
  isMobile = true;
  currentPage = 0;
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
  
  public activeTab = 'Any';
  public searchQuery = '';
  public searching = false;
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
  public rangeSteps = 10000;
  public propSizeRangeSteps = 200;
  public highestPrice = 99999999;
  public lowestPrice = 0;
  public smallestProp = 99999999;
  public largestProp = 0;
  cardView = new Map();

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

  // nextPage(){
  //   console.log("Next page loading...")
  // }
  async searchProperties(nextPage?: boolean, previousPage?: boolean) {
    if(!this.searchQuery){
      const toast = await this.toastController.create({
        message: 'Please enter an area for us to search in',
        duration: 3000, // Duration in milliseconds
        color: 'danger', // Use 'danger' to display in red
        position: 'top' // Position of the toast: 'top', 'middle', 'bottom'
      });
      toast.present();
      setTimeout(() => { 
        this.searching = false;
        document.getElementById("searchButton")?.setAttribute("disabled", "false")
        // document.getElementById("nextPage")?.setAttribute("disabled", "false")
        // // if(this.currentPage > 0)
        //   document.getElementById("prevPage")?.setAttribute("disabled", "false")
      }, 1500)
      return;
    }
    const areaBounds = this.searchQuery?  await this.gmapsService.geocodeAddress(this.searchQuery) : null;
    if (!areaBounds) {
      // TODO Error message
      return;
    }

    console.log(areaBounds);
    console.log(areaBounds.geometry.viewport.toJSON());
    console.log(areaBounds.geometry.viewport.toSpan());
    console.log(this.listings);
    this.listings = [];
    if (!nextPage && !previousPage) {
      this.currentPage = 0;
      this.allListings = [];
    }

    if (previousPage) {
      console.log("Previous page");
      console.log(this.currentPage);
      if (this.currentPage > 0) {
        this.currentPage--;
        console.log(this.currentPage * 5, " - ", this.allListings.length);
        this.listings = this.allListings.slice(this.currentPage * 5, this.currentPage * 5 + 5);
        console.log(this.listings);
      }
      return;
    }
    if (nextPage) {
      if (this.currentPage * 5 + 5 < this.allListings.length) {
        this.currentPage++;
        console.log(this.currentPage * 5, " - ", this.allListings.length);
        this.listings = this.allListings.slice(this.currentPage * 5, this.currentPage * 5 + 5);
        console.log(this.listings);
        return;
      }
      console.log("Next page");
    }

    // document.getElementById("nextPage")?.setAttribute("disabled", "true")
    // document.getElementById("prevPage")?.setAttribute("disabled", "true")
    document.getElementById("searchButton")?.setAttribute("disabled", "true")
    this.buyCount = 0
    this.rentCount = 0;
    this.searching = true;
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
      totalAreaScore : this.totalAreaScore? this.totalAreaScore : null,
      let_sell : this.activeTab ? this.activeTab : null,
      addressViewport: {
        ne: {
          lat: areaBounds.geometry.viewport.getNorthEast().lat(),
          lng: areaBounds.geometry.viewport.getNorthEast().lng(),
        },
        sw: {
          lat: areaBounds.geometry.viewport.getSouthWest().lat(),
          lng: areaBounds.geometry.viewport.getSouthWest().lng(),
        },
      }
    } as GetFilteredListingsRequest;
    if(nextPage && this.allListings.length > 0) {
      request.lastListingId = this.allListings[this.allListings.length - 1].listing_id;
    }
    console.log(request);
    const response = (await this.listingServices.getFilteredListings(request));
    console.log("Response:", response);
    if(!response.listings.length){
      const toast = await this.toastController.create({
        message: 'No listings returned',
        duration: 3000, // Duration in milliseconds
        color: 'danger', // Use 'danger' to display in red
        position: 'bottom' // Position of the toast: 'top', 'middle', 'bottom'
      });
      toast.present();
      setTimeout(() => { 
        this.searching = false;
        document.getElementById("searchButton")?.setAttribute("disabled", "false")
        // document.getElementById("nextPage")?.setAttribute("disabled", "false")
        // // if(this.currentPage > 0)
        //   document.getElementById("prevPage")?.setAttribute("disabled", "false")
      }, 1500)
      return;
    }
    // this.allListings = [];
    console.log(this.allListings);
    this.allListings = this.allListings.concat(response.listings);
    console.log(this.allListings);
    if (nextPage) this.currentPage++;
    console.log(this.currentPage * 5, " - ", this.allListings.length);
    this.listings = this.allListings.slice(this.currentPage * 5, this.currentPage * 5 + 5);
    console.log("Listings: ", this.listings)
    // if (areaBounds) {
    //   for(const listing of response.listings){
    //     const isInArea = await this.gmapsService.checkAddressInArea(areaBounds.geometry.viewport, listing.geometry);
    //     const knockOffResult = await this.gmapsService.knockoffCheckInArea(areaBounds.geometry.viewport, listing.geometry);
    //     if (window.location.hostname.includes("localhost")) {
    //       console.log(isInArea);
    //       console.log(knockOffResult);
    //     }
    //     if(isInArea){
    //       this.allListings.push(listing);
    //       if(listing.let_sell == "Sell"){
    //         this.buyCount++;
    //       }
    //       else if(listing.let_sell == "Rent"){
    //         this.rentCount++;
    //       }
    //     }
    //   }
    // } else {
    //   // this.allListings = response.listings;
    //   for(const list of response.listings){
    //     if(list.let_sell == "Sell"){
    //       this.buyCount++;
    //     }
    //     else if(list.let_sell == "Rent"){
    //       this.rentCount++;
    //     }
    //   }
    // }
    const temp = [];

    if(this.allListings){
      //Recommendation algo
      if(this.userProfile)
      {
        this.userInterestVector = this.profileServices.getInterestArray(this.userProfile);
      }

      for(const list of response.listings)  
      {
        if(list.price > this.highestPrice){
          this.highestPrice = list.price;
        }
        
        if(list.price < this.lowestPrice){
          this.lowestPrice = list.price;
        }

        if(list.property_size > this.largestProp){
          this.largestProp = list.property_size;
        }

        if(list.property_size < this.smallestProp){
          this.smallestProp = list.property_size;
        }
        if (window.location.hostname.includes("localhost"))
          console.log(list.characteristics);
          if(await this.listingServices.recommender(
            list.characteristics, 
            this.userInterestVector
          )){
            this.recommends.push({
              listingID: list.listing_id,
              recommended: true})
            temp.unshift(list);
          }
          else{
            this.recommends.push({
              listingID: list.listing_id,
              recommended: false})
            temp.push(list);
          }
      }

      // this.allListings = temp;

      for(let listing of this.allListings){
        if(listing.listing_id){
          this.cardView.set(listing.listing_id, false)
        }
      }

      if (window.location.hostname.includes("localhost")) {
        console.warn(this.recommends);
        console.warn(this.cardView);
      }

      // this.filterProperties();
      // await this.loadMap();
      // await this.addMarkersToMap();
      // await this.setCentre();

      // this.property_price_values.upper = this.highestPrice;
      // this.property_price_values.lower = this.lowestPrice;
      // this.rangeSteps = (this.highestPrice - this.lowestPrice)/10;

      // this.property_size_values.upper = this.largestProp;
      // this.property_size_values.lower = this.smallestProp;
      // this.propSizeRangeSteps = (this.largestProp - this.smallestProp)/10;

      setTimeout(() => { 
        this.searching = false;
        document.getElementById("searchButton")?.setAttribute("disabled", "false")
      }, 1500)
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
    this.searchQuery = "";

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

  public buyCount = 0;
  public rentCount = 0;
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

    if(this.showAdditionalFilters){
      document.getElementsByClassName("reset-button").item(0)?.setAttribute("style", "display: block; margin-top: 5%; height: 45%");
      document.getElementsByClassName("filter-button").item(0)?.setAttribute("style", "height: 45%");
    }
    else{
      document.getElementsByClassName("reset-button").item(0)?.setAttribute("style", "display: none;")
      document.getElementsByClassName("filter-button").item(0)?.setAttribute("style", "height: 90%");
    }
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

  pinFormatter(value: number) {
    return `R${value}`;
  }

  propSizepinFormatter(value : number){
    return `${value}`;
  }

  formatNumber(num: number): string {
    return num.toString().split('').reverse().join('').replace(/(\d{3})(?=\d)/g, '\$1 ').split('').reverse().join('');
  }

  changeView(listingId : string){
    if(listingId){
      this.cardView.set(listingId, !this.cardView.get(listingId));
    }
  }
  
}


function isMobile(): boolean {
  return window.innerWidth <= 576;
}

