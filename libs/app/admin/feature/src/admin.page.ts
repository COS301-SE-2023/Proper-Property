import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Listing, StatusChange } from '@properproperty/api/listings/util';
import { UserProfile } from '@properproperty/api/profile/util';
import { AuthState } from '@properproperty/app/auth/data-access';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { Unsubscribe, User } from 'firebase/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'properproperty-admin-page',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage{

  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private user: User | null = null;
  private userProfileListener: Unsubscribe | null = null;
  public adminLogged = false;

  nonAppListings : Listing[] = [];
  appListings : Listing[] = [];

  constructor(private listingServices : ListingsService, private router : Router, route : ActivatedRoute, private profileServices : UserProfileService){
    this.user$.subscribe((user) => {
      this.user = user;
      this.profileServices.getUser("" + user?.uid).then((profile) => {
        if(profile !== undefined && profile){
          if(profile.admin){
            this.adminLogged = true;
          }
          else{
            router.navigate(['/home']);
          }
        }
      });
    });

    // Update listener whenever is changes such that it can be unsubscribed from
    // when the window is unloaded
    this.userProfileListener$.subscribe((listener) => {
      this.userProfileListener = listener;
    });

    this.appListings = [];
    this.nonAppListings = [];
    let listings : Listing[] = [];
    this.listingServices.getListings().then((response) => {
      listings = response;

      for(let listing of listings){
        if(listing.approved){
          this.appListings.push(listing);
        }
        else if(!listing.approved){
          this.nonAppListings.push(listing);
        }
      }

      //sorting listings by date created
      this.appListings = this.appListings.sort((a, b) => {
        let tempA2 = a.statusChanges?.[a.statusChanges.length - 1].date ?? "";
        let tempB2 = b.statusChanges?.[b.statusChanges.length - 1].date ?? "";

        let tempA = new Date(tempA2);
        let tempB = new Date(tempB2);
        if(tempA > tempB){
          return -1
        }
        else if(tempA < tempB){
          return 1;
        }
        else{
          return 0;
        }
      })

      this.nonAppListings = this.nonAppListings.sort((a, b) => {
        let tempA = new Date(a.listingDate);
        let tempB = new Date(b.listingDate);
        if(tempA > tempB){
          return -1
        }
        else if(tempA < tempB){
          return 1;
        }
        else{
          return 0;
        }
      })
    });
    

    route.params.subscribe((params) => {
      let statusChange : StatusChange = params['statusChange'];
      if(statusChange && statusChange.adminId){
        router.navigate(['/admin']);
      }
    });
  }

  async redirectToPage(listing : Listing) {
    this.router.navigate(['/listing', {list : listing.listing_id, admin : this.user?.uid}]);
  }
}