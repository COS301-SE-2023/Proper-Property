import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Listing } from '@properproperty/api/listings/util';
import { AuthState } from '@properproperty/app/auth/data-access';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { UserProfileState } from '@properproperty/app/profile/data-access';
import { Unsubscribe, User } from 'firebase/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'properproperty-admin-page',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private user: User | null = null;
  private userProfileListener: Unsubscribe | null = null;
  public loggedIn = false;

  nonAppListings : Listing[] = [];
  appListings : Listing[] = [];

  constructor(private listingServices : ListingsService, private router : Router){
    this.user$.subscribe((user) => {
      this.user = user;
      this.loggedIn = user != null && user != undefined;
    });

    // Update listener whenever is changes such that it can be unsubscribed from
    // when the window is unloaded
    this.userProfileListener$.subscribe((listener) => {
      this.userProfileListener = listener;
    });
  }
  
  async ngOnInit() {
    let listings : Listing[] = [];
    await this.listingServices.getListings().then((response) => {
      listings = response;
    });

    for(let listing of listings){
      if(listing.approved){
        this.appListings.push(listing);
      }
      else if(!listing.approved){
        this.nonAppListings.push(listing);
      }
    }
  }

  async redirectToPage(listing : Listing) {
    this.router.navigate(['/listing', {list : listing.listing_id, admin : this.user?.uid}]);
  }
}
