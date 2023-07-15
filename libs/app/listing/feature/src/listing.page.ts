import { Component, ElementRef, ViewChild} from '@angular/core';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { Listing } from '@properproperty/api/listings/util';
import Swiper from 'swiper';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import { Observable } from 'rxjs';
// import { Unsubscribe } from '@angular/fire/firestore';
import { Select } from '@ngxs/store';
import { app } from 'firebase-admin';


@Component({
  selector: 'app-listing',
  templateUrl: './listing.page.html',
  styleUrls: ['./listing.page.scss'],
})
export class ListingPage{
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  user : UserProfile | null = null;
  @ViewChild('swiper') swiperRef?: ElementRef;
  swiper?: Swiper;
  list : Listing | null = null;
  pointsOfInterest: { photo: string | undefined, name: string }[] = [];
  admin: boolean = false;
  adminId: string = "";


  price_per_sm = 0;
  lister_name = "";
  includes = false;

  constructor(private router: Router, private route: ActivatedRoute, private listingServices : ListingsService, private userServices : UserProfileService, public gmapsService: GmapsService) {
    let list_id = "";
    let admin = "";
    this.route.params.subscribe((params) => {
      console.warn(params); 
      list_id = params['list'];
      admin = params['admin'];
      this.listingServices.getListing(list_id).then((list) => {
        console.warn(list);
        this.list = list;
      }).then(() => {
        if(admin){
          this.admin = true;
          this.adminId = admin;
        }
        // TODO
        console.log(this.list);
        this.price_per_sm = Number(this.list?.price) / Number(this.list?.property_size);
  
        this.userServices.getUser("" + this.list?.user_id).then((user : UserProfile) => {
          console.log(user);
          this.lister_name = user.firstName + " " + user.lastName;
        });
        this.getNearbyPointsOfInterest();
      });
    });

    this.loanAmount = 0;
    this.interestRate = 0;
    this.loanTerm = 0;
    this.monthlyPayment = 0;
    this.totalOnceOffCosts = 0;
    this.minGrossMonthlyIncome = 0;
    this.userProfile$.subscribe((user) => {
      this.user = user;
      if(this.user && this.list){
        console.log(this.user.listings);
        console.log(this.list.listing_id);
        this.includes = this.user.listings?.includes("" + this.list.listing_id) ?? false;
      }
    });
    console.log(this.list);
  }

  async changeStatus(){
    if(this.list && this.adminId != ""){
      this.listingServices.changeStatus("" + this.list.listing_id, this.adminId).then((response) => {
        console.log(response);
        this.router.navigate(['/admin', {statusChange : response}]);
      });
    }
  }

  async getNearbyPointsOfInterest() {
    if (this.list && this.list.address) {
      try {
        const coordinates = await this.gmapsService.getLatLongFromAddress(this.list.address);
        if (coordinates) {
          const results = await this.gmapsService.getNearbyPlaces(
            coordinates.latitude,
            coordinates.longitude
          );
          this.processPointsOfInterestResults(results);
        }
      } catch (error) {
        console.error('Error retrieving nearby places:', error);
      }
    }
  }

  processPointsOfInterestResults(results: google.maps.places.PlaceResult[]) {
    console.log(results);
    // Clear the existing points of interest
    this.pointsOfInterest = [];
  
    // Iterate over the results and extract the icons and names of the places
    for (const result of results) {
      const photo = result.photos?.[0]?.getUrl() || '';
      const name = result.name||'';
  
      this.pointsOfInterest.push({ photo , name });
    }
  }
  


  
  swiperReady() {
    console.log(this.swiperRef?.nativeElement.swiper);
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  goNext() {
    this.swiper?.slideNext();
  }
  goPrev() {
    this.swiper?.slidePrev();
  }

  swiperSlideChanged(e:Event) {
    console.log('changed', e)
  }

  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalOnceOffCosts: number;
  minGrossMonthlyIncome: number;

  calculateMortgage() {
    const principal = this.loanAmount;
    const interestRateMonthly = this.interestRate / 100 / 12;
    const loanTermMonths = this.loanTerm * 12;

    this.monthlyPayment =
      (principal * interestRateMonthly) /
      (1 - Math.pow(1 + interestRateMonthly, -loanTermMonths));

    this.totalOnceOffCosts = principal * 0.03; // Assuming once-off costs are 3% of the loan amount

    this.minGrossMonthlyIncome = this.monthlyPayment * 3; // Assuming minimum income requirement is 3 times the monthly payment
  }

  async getNearbyPlaces() {
    try {
      const coordinates = await this.gmapsService.getLatLongFromAddress(
        this.list?.address + ""
      );
      const results = await this.gmapsService.getNearbyPlaces(
        coordinates.latitude,
        coordinates.longitude
      );
      // Process the nearby places results here
      console.log('Nearby places:', results);
    } catch (error) {
      console.error('Error retrieving nearby places:', error);
    }
  }

}
