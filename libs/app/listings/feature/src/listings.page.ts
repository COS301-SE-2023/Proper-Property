


import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { Router } from '@angular/router';
import { Listing } from '@properproperty/api/listings/util';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthState } from '@properproperty/app/auth/data-access';
import { Unsubscribe, User } from '@angular/fire/auth';
import { UserProfile } from '@properproperty/api/profile/util';


@Component({
  selector: 'app-listings',
  templateUrl: './listings.page.html',
  styleUrls: ['./listings.page.scss'],
})
export class ListingsPage  implements OnInit, OnDestroy, AfterViewInit  {
  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private user: User | null = null;
  private profile : UserProfile | null = null;
  private userProfileListener: Unsubscribe | null = null;


  @ViewChild('map', { static: true })
  mapElementRef!: ElementRef;
  googleMaps: any;
  center = { lat: -25.7477, lng: 28.2433 };
  map: any;
  mapClickListener: any;
  markerClickListener: any;
  markers: any[] = [];
  listings: Listing[] = []


  constructor(
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private listingServices : ListingsService,
    private profileServices : UserProfileService
    ) {
      this.user$.subscribe((user) => {
        this.user = user;
        if(this.user){
          this.profileServices.getUser(this.user.uid).then((profile) =>{
            this.profile = profile;
          });
        }
      });
      // Update listener whenever is changes such that it can be unsubscribed from
      // when the window is unloaded
      this.userProfileListener$.subscribe((listener) => {
        this.userProfileListener = listener;
      });
    }

  async ngOnInit() {
    await this.listingServices.getApprovedListings().then((listings) => {
      this.listings = listings;
    });
  }

  ngAfterViewInit() {
    this.loadMap();
    this.addPropertyMarkers();
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

  
  private addPropertyMarkers() {
    // Iterate over your property data
    this.listings.forEach(async (listing) => {
      const { latitude, longitude } = await this.googleMaps.getLatLongFromAddress(listing.address);
  
      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: this.map,
      });
      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: this.generatePropertyCard(listing).outerHTML,
      });

      // Attach info window to marker click event
      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
    });
  }

  generatePropertyCard(property: Listing): HTMLElement {
    const propertyCard = document.createElement('div');
    propertyCard.className = 'property-card';
  
    const propertyImage = document.createElement('div');
    propertyImage.className = 'property-image';
    const image = document.createElement('img');
    image.src = property.photos[0];
    image.alt = 'Property Image';
    propertyImage.appendChild(image);
  
    const propertyDetails = document.createElement('div');
    propertyDetails.className = 'property-details';
    const title = document.createElement('h3');
    title.className = 'property-title';
    title.textContent = property.prop_type;
    const address = document.createElement('p');
    address.className = 'property-address';
    address.textContent = property.address;
    const price = document.createElement('p');
    price.className = 'property-price';
    price.textContent = property.price;
  
    propertyDetails.appendChild(title);
    propertyDetails.appendChild(address);
    propertyDetails.appendChild(price);
  
    propertyCard.appendChild(propertyImage);
    propertyCard.appendChild(propertyDetails);
  
    return propertyCard;
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

  async redirectToPage(listing : Listing) {
    console.log(listing.listing_id);
    this.router.navigate(['/listing', {list : listing.listing_id}]);
  }

  ngOnDestroy() {
    // this.googleMaps.event.removeAllListeners();
    if(this.mapClickListener) this.googleMaps.event.removeListener(this.mapClickListener);
    if(this.markerClickListener) this.googleMaps.event.removeListener(this.markerClickListener);
  }

  isSaved(listing_id : string){
    if(this.profile){
      if(this.profile.savedListings){
        if(this.profile.savedListings.includes(listing_id)){
          console.log("Listing found in saved: " + listing_id);
          return true;
        }
      }
    }
    else{
      console.log("Profile not found");
    }

    console.log("Not found");
    return false;
  }

  saveListing($event : any, listing_id : string) {
    if(listing_id != ''){
      let heartBut = $event.target as HTMLButtonElement;
      heartBut.style.color = "red";
      
      if(this.profile){
          if(this.profile.savedListings){
            this.profile.savedListings.push(listing_id);
          }
          else{
            this.profile.savedListings = [listing_id];
          }
  
          this.profileServices.updateUserProfile(this.profile);
      }
    } 
  }

  unsaveListing($event : any, listing_id : string){
    if(listing_id != ''){
      let heartBut = $event.target as HTMLButtonElement;
      heartBut.style.color = "red";
      
      if(this.profile){
          if(this.profile.savedListings){
            this.profile.savedListings.splice(this.profile.savedListings.indexOf(listing_id), 1);
          }
  
          this.profileServices.updateUserProfile(this.profile);
      }
    } 
  }
}
