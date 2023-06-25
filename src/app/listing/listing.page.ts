import { Component, ElementRef, Input, ViewChild} from '@angular/core';
import { listing } from '../listing/interfaces/listing.interface';
import Swiper from 'swiper';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingsService } from '../services/listings/listings.service';
import { UserService } from '../services/user/user.service';
import { profile } from '../profile/interfaces/profile.interface';


@Component({
  selector: 'app-listing',
  templateUrl: './listing.page.html',
  styleUrls: ['./listing.page.scss'],
})
export class ListingPage{
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  list : listing | null = null;
  price_per_sm : number = 0;
  lister_name : string = "";

  constructor(private router: Router, private route: ActivatedRoute, private listingServices : ListingsService, private userServices : UserService) {
    this.loanAmount = 0;
    this.interestRate = 0;
    this.loanTerm = 0;
    this.monthlyPayment = 0;
    this.totalOnceOffCosts = 0;
    this.minGrossMonthlyIncome = 0;
   }

  async ngOnInit() {
    let list_id : string = "";
    this.route.params.subscribe((params) => list_id = params['list']);
    await this.listingServices.getListing(list_id).then((list) => {
      this.list = list;
    });
    console.log(this.list);
    this.price_per_sm = Number(this.list?.price) / Number(this.list?.property_size);

    await this.userServices.getUser("" + this.list?.user_id).then((user : profile) => {
      console.log(user);
      this.lister_name = user.first_name + " " + user.last_name;
    })
  }
  
  swiperReady() {
    console.log("swiper being set")
    this.swiper = this.swiperRef?.nativeElement.swiper;
    if(this.swiper){
      console.log("swiper set")
    }
    else{
      console.log("swiper not set")
    }
  }

  goNext() {
    if(this.swiper){
      console.log("yup")
    }
    else{
      console.log("nope")
    }
    this.swiper?.slideNext();
  }
  goPrev() {
    if(this.swiper){
      console.log("yup")
    }
    else{
      console.log("nope")
    }
    this.swiper?.slidePrev();
  }

  swiperSlideChanged(e:any) {
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
