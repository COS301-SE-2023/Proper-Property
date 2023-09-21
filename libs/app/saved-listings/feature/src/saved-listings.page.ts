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
  private userProfileListener: Unsubscribe | null = null;

  isMobile = false;

  public savedListingsB : Listing[] = [];
  public savedListingsR : Listing[] = [];

  constructor(
    private profileServices : UserProfileService,
    private listingServices : ListingsService,
    private router : Router
    ) {
      // this.savedListings = [];
    this.userProfile$.subscribe((profile) => {
      this.userProfile = profile;
      if(this.userProfile){
        //Todo - Change this to send an array of IDs
        if(this.userProfile && this.userProfile.savedListings){
          this.savedListingsB = [];
          this.savedListingsR = [];
          for(const listing of this.userProfile.savedListings){
            this.listingServices.getListing(listing).then((listing) => {
              if(listing){
                // this.savedListings.push(listing);

                if(listing.let_sell=="Sell")
                {
                  this.savedListingsB.push(listing);
                }
                else
                {
                  this.savedListingsR.push(listing);
                }
              }
            });
          }
        }
      }
    });
    // Update listener whenever is changes such that it can be unsubscribed from
    // when the window is unloaded
    this.userProfileListener$.subscribe((listener) => {
      this.userProfileListener = listener;
    });
  }

  ngOnInit() {
    console.log ("Linter: Lifecycle methods should not be empty");
    this.isMobile = isMobile();
  }

  async redirectToPage(listing : Listing) {
    console.log(listing.listing_id);
    this.router.navigate(['/listing', {list : listing.listing_id}]);
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
                console.log(editedListingArray);
                console.log(this.savedListingsB);
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
}
function isMobile(): boolean {
  return window.innerWidth <= 576;
}
