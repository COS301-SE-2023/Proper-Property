import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { listing } from '@properproperty/app/listing/util';
import Swiper from 'swiper';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { UserService } from '@properproperty/app/user/data-access';
import { profile } from '@properproperty/app/profile/util';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthState } from '@properproperty/app/auth/data-access';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.page.html',
  styleUrls: ['./listing.page.scss'],
})

export class ListingPage implements OnInit{
  
  @Select(AuthState.user) user$!: Observable<User | null>;
  currentUser: User | null = null;

  @ViewChild('swiper') swiperRef?: ElementRef;
  swiper?: Swiper;
  list : listing | null = null;
  pointsOfInterest: { photo: string | undefined, name: string }[] = [];


  price_per_sm = 0;
  lister_name = "";

  constructor(private router: Router,
     private route: ActivatedRoute, 
     private listingServices : ListingsService, 
     private userServices : UserService,
     public gmapsService: GmapsService) {
    this.loanAmount = 0;
    this.interestRate = 0;
    this.loanTerm = 0;
    this.monthlyPayment = 0;
    this.totalOnceOffCosts = 0;
    this.minGrossMonthlyIncome = 0;

    this.user$.subscribe((user: User | null) => {
      this.currentUser =  user;
    });
   }


  async ngOnInit() {
    let list_id = "";
    this.route.params.subscribe((params) => list_id = params['list']);
    await this.listingServices.getListing(list_id).then((list) => {
      this.list = list;
      this.getNearbyPointsOfInterest();
    });
    console.log(this.list);
    this.price_per_sm = Number(this.list?.price) / Number(this.list?.property_size);

    await this.userServices.getUser("" + this.list?.user_id).then((user : profile) => {
      console.log(user);
      this.lister_name = user.first_name + " " + user.last_name;
    })
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

  saveListing() {
    // this.user$.subscribe((user: User | null) => {
    //   this.currentUser =  user;
    // });

    console.log("hellow");
  }
}
