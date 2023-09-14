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

  public savedListings : Listing[] = [];
  public savedListingsB : Listing[] = [];
  public savedListingsR : Listing[] = [];

  constructor(
    private profileServices : UserProfileService,
    private listingServices : ListingsService,
    private router : Router
    ) {
      this.savedListings = [];
    this.userProfile$.subscribe((profile) => {
      this.userProfile = profile;
      if(this.userProfile){
        //Todo - Change this to send an array of IDs
        if(this.userProfile && this.userProfile.savedListings){
          for(const listing of this.userProfile.savedListings){
            this.listingServices.getListing(listing).then((listing) => {
              if(listing){
                this.savedListings.push(listing);

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

  isSaved(listing_id : string){
    if(this.userProfile){
      if(this.userProfile.savedListings){
        if(this.userProfile.savedListings.includes(listing_id)){
          return true;
        }
      }
    }
    else{
      console.log("Profile not found");
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

  unsaveListing($event : Event, listing_id : string){
    if(listing_id != ''){
      const heartBut = $event.target as HTMLButtonElement;
      heartBut.style.color = "red";
      
      if(this.userProfile){
          if(this.userProfile.savedListings){
            this.userProfile.savedListings.splice(this.userProfile.savedListings.indexOf(listing_id), 1);
            for(const listing of this.savedListings){
              if(listing.listing_id == listing_id){
                this.savedListings.splice(this.savedListings.indexOf(listing), 1);
              }
            }
          }
  
          this.profileServices.updateUserProfile(this.userProfile);
      }
    } 
  } 
}
function isMobile(): boolean {
  return window.innerWidth <= 576;
}
