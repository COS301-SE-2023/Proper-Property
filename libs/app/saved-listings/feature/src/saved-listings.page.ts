import { Component, OnInit } from '@angular/core';
import { UserProfile } from '@properproperty/api/profile/util';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Unsubscribe } from '@angular/fire/auth';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { Listing } from '@properproperty/api/listings/util';
import { Router } from '@angular/router';


@Component({
  selector: 'app-saved-listings',
  templateUrl: './saved-listings.page.html',
  styleUrls: ['./saved-listings.page.scss'],
})
export class SavedListingsPage implements OnInit {

  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private userProfile : UserProfile | null = null;

  isMobile = false;

  public savedListings : Listing[] = [];
  public savedListingsB : Listing[] = [];
  public savedListingsR : Listing[] = [];
  loading = false;
  loadingMessage = "Loading your saved listings...";

  constructor(
    private profileServices : UserProfileService,
    private listingServices : ListingsService,
    private router : Router
    ) {
      this.savedListings = [];
  }

  async ngOnInit() {
    this.isMobile = isMobile();
    this.loading = true;
    this.userProfile$.subscribe(async (profile) => {
      this.userProfile = profile;
      if(this.userProfile){
        //Todo - Change this to send an array of IDs
        if(this.userProfile && this.userProfile.savedListings){
          const tempB: Listing [] = [];
          const tempR: Listing [] = [];
          for(const listing of this.userProfile.savedListings){
            await this.listingServices.getListing(listing).then((listing) => {
              if(listing){
                // this.savedListings.push(listing);
  
                if(listing.let_sell=="Sell")
                {
                  tempB.push(listing);
                }
                else
                {
                  tempR.push(listing);
                }
              }
            });
          }
          this.savedListingsB = tempB;
          this.savedListingsR = tempR;
          if (window.location.hostname.includes("localhost")) {
            console.log(this.userProfile.savedListings);
            console.log(this.savedListingsB);
            console.log(this.savedListingsR);
          }
            
        }
      }
    });

    setTimeout(() => {
      this.loading = false;
    }, 3000);
  }

  async redirectToPage(listing : Listing) {
    this.router.navigate(['/listing', {list : listing.listing_id}]);
  }

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

  saveListing($event : Event, listing_id : string) {
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

  unsaveListing($event : Event, listing_id : string, side : string){
    const editedListingArray = side == "buy" ? this.savedListingsB : this.savedListingsR;
    if(listing_id != ''){
      const heartBut = $event.target as HTMLButtonElement;
      heartBut.style.color = "red";
      
      if(this.userProfile){
          if(this.userProfile.savedListings){
            this.userProfile.savedListings.splice(this.userProfile.savedListings.indexOf(listing_id), 1);
            for(const listing of editedListingArray){
              if(listing.listing_id == listing_id){
                editedListingArray.splice(editedListingArray.indexOf(listing), 1);
              }
            }
          }
  
          this.profileServices.updateUserProfile(this.userProfile);
      }
    } 
  }

  Change()
  {
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

  formatNumber(num: number): string {
    return num.toString().split('').reverse().join('').replace(/(\d{3})(?=\d)/g, '\$1 ').split('').reverse().join('');
  }
}
function isMobile(): boolean {
  return window.innerWidth <= 576;
}
