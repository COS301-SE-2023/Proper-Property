import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { Router } from '@angular/router';
import { listing } from '@properproperty/app/listing/util';

interface Property {
  title: string;
  type: string;
  price: number;
  bedrooms: number;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})


export class SearchPage implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('address', { static: true }) addressInput!: ElementRef<HTMLInputElement>;

  autocomplete: any;
  defaultBounds: google.maps.LatLngBounds;
  predictions: google.maps.places.AutocompletePrediction[] = [];

  @ViewChild('map', { static: true })
  mapElementRef!: ElementRef;
  googleMaps: any;
  center = { lat: -25.7477, lng: 28.2433 };
  map: any;
  mapClickListener: any;
  markerClickListener: any;
  markers: any[] = [];
  listings: listing[] = []



  constructor(
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private listingServices : ListingsService,
    public gmapsService: GmapsService
    ) {
      this.predictions = [];
      this.defaultBounds = new google.maps.LatLngBounds();
      
    }

  async ngOnInit() {
    await this.listingServices.getListings().then((listings) => {
      this.listings = listings;
    });

    const inputElementId = 'address';

    
    this.gmapsService.setupRegionSearchBox(inputElementId);
    
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



  ngAfterViewInit() {
    
    this.loadMap();
  }

async loadMap() {
  try {
    const googleMaps: any = await this.gmaps.loadGoogleMaps();
    this.googleMaps = googleMaps;
    const mapEl = this.mapElementRef.nativeElement;
    const location = new googleMaps.LatLng(this.center.lat, this.center.lng);
    this.map = new googleMaps.Map(mapEl, {
      center: location,
      zoom: 12,
    });
    this.renderer.addClass(mapEl, 'visible');
    this.addMarker(location);
    this.onMapClick();
  } catch(e) {
    console.log(e);
  }
}

onMapClick() {
  this.mapClickListener = this.googleMaps.event.addListener(this.map, "click", (mapsMouseEvent: { latLng: { toJSON: () => any; }; }) => {
    console.log(mapsMouseEvent.latLng.toJSON());
    this.addMarker(mapsMouseEvent.latLng);
  });
}

addMarker(location: any) {
  const googleMaps: any = this.googleMaps;
  const icon = {
    url: 'assets/icon/map_card.png',
    scaledSize: new googleMaps.Size(100, 50), 
  };
  const marker = new googleMaps.Marker({
    position: location,
    map: this.map,
    icon: icon,
    // draggable: true,
    animation: googleMaps.Animation.DROP
  });
  this.markers.push(marker);
  // this.presentActionSheet();
  this.markerClickListener = this.googleMaps.event.addListener(marker, 'click', () => {
    console.log('markerclick', marker);
    this.checkAndRemoveMarker(marker);
    console.log('markers: ', this.markers);
  });
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



async redirectToPage(listing : listing) {
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

Templistings: listing[] = []

searchProperties() {
  const filteredListings = this.listings.filter(listing => {
    const addressMatch = listing.address.toLowerCase().includes(this.searchQuery.toLowerCase());
    const bedroomsMatch = this.selectedBedrooms === 0 || listing.bed === this.selectedBedrooms.toString();
    const floorMatch = this.selectedFloorSize === 0 || parseInt(listing.floor_size) >= this.selectedFloorSize;
    const minPriceMatch = this.selectedMinPrice === 0 || parseInt(listing.price) >= this.selectedMinPrice;
    const maxPriceMatch = this.selectedMaxPrice === 0 || parseInt(listing.price) <= this.selectedMaxPrice;
    const propertyTypeMatch = this.selectedPropertyType === '' || listing.prop_type.includes(this.selectedPropertyType);

    return addressMatch && bedroomsMatch && floorMatch && minPriceMatch && maxPriceMatch && propertyTypeMatch;
  });

  this.listings = filteredListings;
}

resetFilters() {
  this.selectedPropertyType = '';
  this.selectedMinPrice = 0;
  this.selectedMaxPrice = 0;
  this.selectedBedrooms = 0;
  this.selectedBathrooms = 0;
  this.selectedParking = 0;
  this.selectedFloorSize = 0;
  this.selectedErfSize = 0;
  this.petFriendly = false;
  this.garden = false;
  this.pool = false;
  this.flatlet = false;
  this.other = false;
  this.retirement = false;
  this.repossession = false;
  this.onShow = false;
  this.securityEstate = false;
  this.auction = false;
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
selectedFloorSize = 0;
selectedErfSize = 0;
petFriendly = false;
garden = false;
pool = false;
flatlet = false;
other = false;
retirement = false;
repossession = false;
onShow = false;
securityEstate = false;
auction = false;

properties: Property[] = [
  { title: 'House 1', type: 'house', price: 100000, bedrooms: 3 },
  { title: 'Apartment 1', type: 'apartment', price: 1500, bedrooms: 2 },
  { title: 'Condo 1', type: 'condo', price: 2000, bedrooms: 1 },
  // Add more properties here
];

get filteredBuyingProperties(): Property[] {
  return this.properties.filter(property =>
    property.type.includes(this.selectedPropertyType) &&
    property.price >= this.selectedMinPrice &&
    property.price <= this.selectedMaxPrice &&
    (this.selectedBedrooms === 0 || property.bedrooms === this.selectedBedrooms) &&
    property.title.toLowerCase().includes(this.searchQuery.toLowerCase())
  );
}

get filteredRentingProperties(): Property[] {
  // Add your own logic for filtering listing properties
  // based on the selected filters and search query
  return [];
}

filterProperties(): void {
  // Update the filtered properties based on the selected filters and search query
  if (this.activeTab === 'buying') {
    this.filteredBuyingProperties;
  } else if (this.activeTab === 'rent') {
    this.filteredRentingProperties;
  }
}

changeTab(): void {
  // Reset the selected filters and search query when changing tabs
  this.selectedPropertyType = '';
  this.selectedMinPrice = 0;
  this.selectedMaxPrice = 0;
  this.selectedBedrooms = 0;
  this.searchQuery = '';
  this.filterProperties();
}


toggleAdditionalFilters(): void {
  this.showAdditionalFilters = !this.showAdditionalFilters;
  this.filterProperties();
}

}

