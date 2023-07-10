import { Component, ElementRef, ViewChild} from '@angular/core';
import { Listing } from '@properproperty/app/listing/util';
import Swiper from 'swiper';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import { Observable } from 'rxjs';
// import { Unsubscribe } from '@angular/fire/firestore';
import { Select } from '@ngxs/store';


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
  price_per_sm = 0;
  lister_name = "";
  includes = false;

  constructor(private router: Router, private route: ActivatedRoute, private listingServices : ListingsService, private userServices : UserProfileService) {
    let list_id = "";
    this.route.params.subscribe((params) => list_id = params['list']);
    this.listingServices.getListing(list_id).then((list) => {
      this.list = list;
    }).then(() => {
      // TODO
      // console.log(this.list);
      // this.price_per_sm = Number(this.list?.price) / Number(this.list?.property_size);

      // this.userServices.getUser("" + this.list?.user_id).then((user : UserProfile) => {
      //   console.log(user);
      //   this.lister_name = user.firstName + " " + user.lastName;
      });
    // });
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
        if(this.user.listings?.includes("" + this.list.listing_id)){
          this.includes = true;
        }
        else this.includes = false;
      }
    });
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

}
