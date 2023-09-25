


import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { Router } from '@angular/router';
import { Listing } from '@properproperty/api/listings/util';
import { UserProfileService } from '@properproperty/app/profile/data-access';
import { User } from '@angular/fire/auth';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthState } from '@properproperty/app/auth/data-access';



@Component({
  selector: 'app-my-listings',
  templateUrl: './my-listings.page.html',
  styleUrls: ['./my-listings.page.scss'],
})
export class MyListingsPage  implements OnInit, OnDestroy  {
  @Select(AuthState.user) user$!: Observable<User | null>;
  currentUser: User | null = null;
  @ViewChild('map', { static: true })
  mapElementRef!: ElementRef;
  googleMaps: any;
  center = { lat: -25.7477, lng: 28.2433 };
  map: any;
  mapClickListener: any;
  markerClickListener: any;
  markers: any[] = [];
  listings: Listing[] = []
  listingsB: Listing[]=[];
  listingsR: Listing[]=[]
  loading = false;
  loadingMessage = ";"

  constructor(
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private listingServices : ListingsService,
    private userServices: UserProfileService,
    ) {
      this.user$.subscribe((user: User | null) => {
        this.currentUser =  user;
      });
      //this.userServices.getCurrentUser()?.user_id      
    }

  async ngOnInit() {
    this.loadingMessage = "Loading your listings..."
    this.listingsB = [];
    this.listingsR = [];
    this.listings = [];
    this.loading = true;
    this.listings = await this.listingServices.getListings(this.currentUser?.uid);
    const user_listings: Listing[] = [];

    //for i = 0; i< listings size i++
    for (const listing of this.listings) {
      //get the user_id of the listing
      const user_ID = listing.user_id;
      //declare a listing[] array
      if (this.currentUser?.uid == user_ID) {
        user_listings.push(listing);
        // Forgive me father for I have sinned
        // (listing.let_sell=="Sell" ? this.listingsB : this.listingsR).push(listing);
        if (listing.let_sell=="Sell")
          this.listingsB.push(listing);
        else
          this.listingsR.push(listing);
      }
    }
    
    setTimeout(() => {
    this.loading = false;
    }, 3000);
  }

  async redirectToPage(listing : Listing) {
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

  isLiked = true;

  unlikeCard() {
    // Handle unliking logic here
    this.isLiked = false;
  }

  Change(){
    const tog1 = document.getElementById("first") as HTMLInputElement;
    const tog2 = document.getElementById("second") as HTMLInputElement;

    if(tog1.style.display=='block')
    {
      
      tog1.style.display= 'none';
      tog2.style.display = 'block';

    }
    else
    {
      tog1.style.display= 'block';
      tog2.style.display = 'none';
    }

  }
}
  

