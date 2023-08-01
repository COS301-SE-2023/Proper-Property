import { Component, OnInit } from '@angular/core';
import { UserProfile } from '@properproperty/api/profile/util';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthState } from '@properproperty/app/auth/data-access';
import { Unsubscribe, User } from '@angular/fire/auth';
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

  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private user: User | null = null;
  private profile : UserProfile | null = null;
  private userProfileListener: Unsubscribe | null = null;

  public savedListings : Listing[] = [];

  constructor(
    private profileServices : UserProfileService,
    private listingServices : ListingsService,
    private router : Router
    ) {
    this.user$.subscribe((user) => {
      this.user = user;
      if(this.user){
        this.profileServices.getUser(this.user.uid).then((profile) =>{
          this.profile = profile;
          //Todo - Change this to send an array of IDs
          if(this.profile && this.profile.savedListings){
            for(const listing of this.profile.savedListings){
              this.listingServices.getListing(listing).then((listing) => {
                if(listing){
                  this.savedListings.push(listing);
                }
              });
            }
          }
        });
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
  }

  async redirectToPage(listing : Listing) {
    console.log(listing.listing_id);
    this.router.navigate(['/listing', {list : listing.listing_id}]);
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
      const heartBut = $event.target as HTMLButtonElement;
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
      const heartBut = $event.target as HTMLButtonElement;
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
