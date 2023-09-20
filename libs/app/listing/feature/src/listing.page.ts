import { Component, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { Listing, StatusEnum } from '@properproperty/api/listings/util';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import { Observable, of } from 'rxjs';
import { Select } from '@ngxs/store';
import { httpsCallable, Functions } from '@angular/fire/functions';
import { Chart, registerables } from 'chart.js';
import { Unsubscribe } from 'firebase/auth';
import { IonContent } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { GeocodeRequest } from '@googlemaps/google-maps-services-js';

register();
export interface GetAnalyticsDataRequest {
  listingId: string;
}
@Component({
  selector: 'app-listing',
  templateUrl: './listing.page.html',
  styleUrls: ['./listing.page.scss'],
})
export class ListingPage implements OnDestroy {
  @ViewChild(IonContent) content: IonContent | undefined;
  // @ViewChild("avgEnagement") avgEnagement: IonInput | undefined;

  isMobile: boolean;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private userProfile: UserProfile | null = null;
  private userProfileListener: Unsubscribe | null = null;
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  list: Listing | null = null;
  lister: UserProfile | null = null
  listerId = "";
  listingId = "";
  pointsOfInterest: { photo: string | undefined, name: string }[] = [];
  admin = false;
  adminId = "";
  public ownerViewing$: Observable<boolean> = of(false);
  coordinates: { latitude: number, longitude: number } | null = null;
  profilePic = "";

  price_per_sm = 0;
  lister_name = "";
  avgEnagement = "";
  includes = false;
  Months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  isRed = false;
  showData = false;

  areaScore = 0;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private listingServices: ListingsService,
    private userServices: UserProfileService,
    public gmapsService: GmapsService,
    private functions: Functions,
    private profileServices: UserProfileService) {
    let list_id = "";
    let admin = "";

    this.route.params.subscribe((params) => {
      console.warn(params);
      list_id = params['list'];
      admin = params['admin'];
      this.listingId = list_id;

      this.listingServices.getListing(list_id).then((list) => {
        console.warn(list);
        this.list = list;
      }).then(() => {
        if (admin) {
          this.admin = true;
          this.adminId = admin;
        }

        
        // TODO
        console.log(this.list);

        if (!this.list?.price || !this.list?.property_size) {
          console.error("Both Property Size and Price need to be specified");
          return
        }
        this.price_per_sm = this.list?.price / this.list?.property_size;
  
        this.userServices.getUser("" + this.list?.user_id).then((user : UserProfile) => {
          this.lister = user;
          this.lister_name = user.firstName + " " + user.lastName;
        });

        this.userProfile$.subscribe((profile) => {
          this.userProfile = profile;
          this.isRed = this.isSaved(this.listingId);
          if (profile && this.list && this.userProfile?.userId == this.list?.user_id) {
            this.ownerViewing$ = of(true);
            this.profilePic = this.userProfile?.profilePicture ?? "";
          }
        });

        // when the window is unloaded
        this.userProfileListener$.subscribe((listener) => {
          this.userProfileListener = listener;
        });

      if(this.list?.geometry && this.list?.status == StatusEnum.ON_MARKET){
        this.getNearbyPointsOfInterest();
        this.setCrimeScore();
        this.setSanitationScore();
        this.setSchoolRating();
        this.setWaterScore();
      }
      });
    });

    this.loanAmount = 0;
    this.interestRate = 0;
    this.loanTerm = 0;
    this.monthlyPayment = 0;
    this.totalOnceOffCosts = 0;
    this.minGrossMonthlyIncome = 0;
    Chart.register(...registerables);

    // Update listener whenever is changes such that it can be unsubscribed from
    // when the window is unloaded
    this.userProfileListener$.subscribe((listener) => {
      this.userProfileListener = listener;
    });

    this.isMobile = isMobile();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    console.log(event);
    this.isMobile = window.innerWidth <= 576;
  }

  async showAnalytics() {
    const loader = document.querySelector(".graph-animation") as HTMLElement;
    loader.style.display = "block";
    const request: GetAnalyticsDataRequest = { listingId: this.list?.listing_id ?? "" };
    const analyticsData = JSON.parse((await httpsCallable(this.functions, 'getAnalyticsData')(request)).data as string);
    if (analyticsData == null) {
      return;
    }

    let totUsers = 0;
    let totEngagement = 0;

    console.log(analyticsData);
    let dates: string[] = [];
    let pageViews: number[] = [];

    const rows = analyticsData.rows ?? [];
    for(let i = 0; rows && i < rows.length; i++){
      if (rows[i]?.dimensionValues[1] && rows[i]?.metricValues[0]) {
        const dimensionValue = rows[i].dimensionValues[1].value;
        const year = Number(dimensionValue.substring(0, 4));
        const month = Number(dimensionValue.substring(4, 6));
        const day = Number(dimensionValue.substring(6, 8));


        const tempDate = new Date(year, month, day)

        dates[i] = tempDate.getDate() + " " + this.Months[tempDate.getMonth() - 1];

        const metricValue = rows[i].metricValues[0].value;
        pageViews[i] = Number(metricValue);

        totEngagement += Number(rows[i].metricValues[1].value);
        totUsers += Number(rows[i].metricValues[2].value);
      }
    }

    dates = dates.reverse();
    pageViews = pageViews.reverse();

    const data = {
      labels: dates,
      datasets: [{
        label: 'Page Views per Day',
        data: pageViews,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0,
        options: {
          scales: {
            y: {
              ticks: {
                stepSize: 10,
              }
            }
          }
        }
      }]
    };

    const canvas = document.getElementById('lineGraph');

    if (canvas) {
      const chart = new Chart(canvas as HTMLCanvasElement, {
        type: 'line',
        data: data,
      });

      if (chart) {
        console.log("Chart created")
      }
    }
    const avgPerUser = totEngagement / totUsers;
    const minutes = Math.floor(avgPerUser / 60);
    const seconds = (avgPerUser - minutes * 60).toPrecision(2);

    this.avgEnagement = minutes + " min " + seconds + " sec";
    this.showData = true;
    const element = document.querySelector(".graph") as HTMLElement;
    loader.style.display = "none";
    element.style.display = "block";
    return;
  }

  async changeStatus(approved : boolean){
    if(this.list && this.adminId != ""){
      let crimeScore;
      let schoolScore;
      let waterScore;
      let sanitationScore;
      const show = document.querySelector('#show') as HTMLDivElement;
      show.style.opacity = "0";
      const load = document.querySelector('#loader') as HTMLElement;
      load.style.opacity = "1";
      if (this.list.geometry.lat == 0 || this.list.geometry.lat) {
        const geocodeResult = await this.gmapsService.geocodeAddress(this.list.address);
        this.list.geometry = {
          lat: geocodeResult?.geometry.location.lat() ?? 0,
          lng: geocodeResult?.geometry.location.lng() ?? 0
        }
      }
      if ((this.list.status == StatusEnum.PENDING_APPROVAL || this.list.status == StatusEnum.EDITED) && approved) {
        crimeScore = await this.getCrimeScore();
        schoolScore = await this.getSchoolRating(this.list.geometry);
        waterScore = await this.getWaterScore();
        sanitationScore = await this.getSanitationScore();
        console.log(crimeScore, schoolScore, waterScore, sanitationScore);
      }


      console.log("Changing status");
      if(
        approved
        && (this.list.status == StatusEnum.PENDING_APPROVAL || StatusEnum.EDITED)
        && crimeScore != undefined 
        && schoolScore != undefined 
        && waterScore != undefined
        && sanitationScore != undefined
      ){
        console.log("Adding to market")
        await this.listingServices.changeStatus("" + this.list.listing_id, this.adminId, StatusEnum.ON_MARKET, crimeScore, waterScore, sanitationScore, schoolScore);
      } 
      else if((this.list.status == StatusEnum.PENDING_APPROVAL || StatusEnum.EDITED) && approved){
        console.log("Adding to market")
        await this.listingServices.changeStatus("" + this.list.listing_id, this.adminId, StatusEnum.ON_MARKET, 0, 0, 0, 0);
      }
      else{
        console.log("Denied")
        await this.listingServices.changeStatus("" + this.list.listing_id, this.adminId, StatusEnum.DENIED, 0, 0, 0, 0);
      }
      setTimeout( function finishLoading(){
        if(!show){
          console.log("Show does not exist");
        }
        load.style.opacity="0";
        show.style.opacity="1";
      }, 500)
      this.router.navigate(['/admin']);
    }
  }

  async getNearbyPointsOfInterest() {
    if (this.list?.listing_id) {
      try {
        const response = await this.gmapsService.getNearbyPlaces2(this.list.listing_id)
        response.forEach((place) => {
          let distance = -1;
          if(this.list?.geometry.lat){
            distance = this.gmapsService.calculateDistanceInMeters(
              this.list?.geometry.lat,
              this.list?.geometry.lng,
              place.geometry.lat,
              place.geometry.lng
            );
          }
          const naam = place.name + " ("+ (distance / 1000).toFixed(2)+"km)";
          this.pointsOfInterest.push({photo : place.photos, name : naam})
        })
      } catch (error) {
        console.error('Error retrieving nearby places:', error);
      }
    }
  }

  async getSchoolRating(coordinates: { lat: number, lng: number }): Promise<number> {
    if (this.list) {
      try {
        if (coordinates) {
          const response = await this.gmapsService.getNearbySchools(coordinates.lat, coordinates.lng);
          // console.log("schools: " + schools);
          if (response.length > 0) {
            let totalRating = 0;
            for (let i = 0; i < response.length; i++) {
              totalRating += response[i].rating ?? 0;
            }
            console.log("School is here bitch");
            return (totalRating / response.length) * 20;
          }

          return 0;
        }
      }
      catch (error) {
        console.error('Error retrieving nearby places:', error);
      }
    }

    return 0;
  }

  setSchoolRating() {
    if (this.list) {
      if (this.list?.areaScore.schoolScore < 25) {
        document.getElementById("schoolProgress")?.setAttribute("style", "width: " + this.list?.areaScore.schoolScore + "%;");
        document.getElementById("schoolProgress")?.setAttribute("class", "errorProgressBar");
      }
      else if (this.list?.areaScore.schoolScore < 60) {
        document.getElementById("schoolProgress")?.setAttribute("style", "width: " + this.list?.areaScore.schoolScore + "%;");
        document.getElementById("schoolProgress")?.setAttribute("class", "warningProgressBar");
      }
      else {
        document.getElementById("schoolProgress")?.setAttribute("style", "width: " + this.list?.areaScore.schoolScore + "%");
      }

      this.areaScore = parseInt(((this.areaScore + this.list?.areaScore.schoolScore) / 2).toFixed(2));
    }
  }

  async getSanitationScore(): Promise<number> {
    if (this.list) {
      const response = await this.listingServices.getSanitationScore(this.list.district)
      console.log("SANITATION SCORE:", (response.percentage ? response.percentage : 0) * 100);
      console.log("Sanitation is here bitch");
      return (response.percentage ? response.percentage : 0) * 100;
    }

    return 0;
  }

  setSanitationScore() {
    if (this.list) {
      if (this.list?.areaScore.sanitationScore < 25) {
        document.getElementById("sanitationProgress")?.setAttribute("style", "width: " + this.list?.areaScore.sanitationScore + "%;");
        document.getElementById("sanitationProgress")?.setAttribute("class", "errorProgressBar");
      }
      else if (this.list?.areaScore.sanitationScore < 60) {
        document.getElementById("sanitationProgress")?.setAttribute("style", "width: " + this.list?.areaScore.sanitationScore + "%;");
        document.getElementById("sanitationProgress")?.setAttribute("class", "warningProgressBar");
      }
      else {
        document.getElementById("sanitationProgress")?.setAttribute("style", "width: " + this.list?.areaScore.sanitationScore + "%");
      }

      this.areaScore = parseInt(((this.areaScore + this.list?.areaScore.sanitationScore) / 2).toFixed(2));
    }
  }

  async getWaterScore(): Promise<number> {
    if (this.list) {
      console.log("Calculating water score")
      const response = await this.listingServices.getWaterScore(this.list.district
        , this.list.listingAreaType
        , this.list.prop_type
        , { lat: this.list.geometry.lat , long: this.list.geometry.lng })
      console.log("Water is here bitch");
      return (response.percentage ? response.percentage : 0) * 100;
    }

    return 0;
  }

  setWaterScore() {
    if (this.list) {
      if (this.list?.areaScore.waterScore < 25) {
        document.getElementById("waterProgress")?.setAttribute("style", "width: " + this.list?.areaScore.waterScore + "%;");
        document.getElementById("waterProgress")?.setAttribute("class", "errorProgressBar");
      }
      else if (this.list?.areaScore.waterScore < 60) {
        document.getElementById("waterProgress")?.setAttribute("style", "width: " + this.list?.areaScore.waterScore + "%;");
        document.getElementById("waterProgress")?.setAttribute("class", "warningProgressBar");
      }
      else {
        document.getElementById("waterProgress")?.setAttribute("style", "width: " + this.list?.areaScore.waterScore + "%");
      }

      this.areaScore = parseInt(((this.areaScore + this.list?.areaScore.waterScore) / 2).toFixed(2));
    }
  }


  async getCrimeScore(): Promise<number> {
    if (this.list) {
      try {
        const response = await this.listingServices.getCrimeScore({ lat: this.list.geometry.lat, long: this.list.geometry.lng });
        console.log("CRIME SCORE:", response.percentage ? response.percentage * 100 : "error");
        console.log(response);
        console.log("Crime is here bitch");
        return (response.percentage ? response.percentage : 0) * 100;
      }
      catch (error) {
        console.error('Error retrieving nearby places:', error);
      }
    }

    return 0;
  }

  setCrimeScore() {
    if (this.list) {
      if (this.list?.areaScore.crimeScore < 25) {
        document.getElementById("crimeProgress")?.setAttribute("style", "width: " + this.list?.areaScore.crimeScore + "%;");
        document.getElementById("crimeProgress")?.setAttribute("class", "errorProgressBar");
      }
      else if (this.list?.areaScore.crimeScore < 60) {
        document.getElementById("crimeProgress")?.setAttribute("style", "width: " + this.list?.areaScore.crimeScore + "%;");
        document.getElementById("crimeProgress")?.setAttribute("class", "warningProgressBar");
      }
      else {
        document.getElementById("crimeProgress")?.setAttribute("style", "width: " + this.list?.areaScore.crimeScore + "%");
      }

      this.areaScore = parseInt(((this.areaScore + this.list?.areaScore.crimeScore) / 2).toFixed(2));
    }
  }
  
  goNext(event: Event) {
    console.log(event)
    if (this.swiperRef) {
      this.swiperRef.nativeElement.swiper.slideNext();
    }
    else {
      console.log("Swiper undefined");
    }
  }
  goPrev() {
    if (this.swiperRef) {
      this.swiperRef.nativeElement.swiper.slidePrev();
    }
    else {
      console.log("Swiper undefined");
    }
  }

  swiperSlideChanged(e: Event) {
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

  // async getNearbyPlaces() {
  //   try {
  //     if(this.list?.geometry){
  //       const results = await this.gmapsService.getNearbyPlaces(
  //         this.list.geometry.lat,
  //         this.list.geometry.lng
  //       );
  //       // Process the nearby places results here
  //       console.log('Nearby places:', results);
  //     }
  //   } catch (error) {
  //     console.error('Error retrieving nearby places:', error);
  //   }
  // }

  toggleColor() {
    if (this.isRed)
      this.unsaveListing();
    else
      this.saveListing();


    this.isRed = !this.isRed;
  }

  isSaved(listing_id: string) {
    if (this.userProfile) {
      if (this.userProfile.savedListings) {
        if (this.userProfile.savedListings.includes(listing_id)) {
          console.log("Listing found in saved: " + listing_id);
          return true;
        }
      }
    }

    return false;
  }

  saveListing() {
    if (!this.isSaved(this.listingId)) {
      if (this.userProfile) {
        if (this.userProfile.savedListings) {
          this.userProfile.savedListings.push(this.listingId);
        }
        else {
          this.userProfile.savedListings = [this.listingId];
        }

        this.profileServices.updateUserProfile(this.userProfile);
      }
    }
  }

  unsaveListing() {
    if (this.isSaved(this.listingId)) {
      if (this.userProfile) {
        if (this.userProfile.savedListings) {
          this.userProfile.savedListings.splice(this.userProfile.savedListings.indexOf(this.listingId), 1);
        }
        this.profileServices.updateUserProfile(this.userProfile);
      }
    }
  }

  isModalOpen = false;

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  scrollToBottom() {
    if (this.content && document.getElementById('calculator')) {
      console.log(document.getElementById('calculator')?.getBoundingClientRect().top);
      const calculatorRow = document.getElementById('calculator')?.getBoundingClientRect().top;
      this.content.scrollToPoint(0, ((calculatorRow ?? 100)), 500);
    }
  }

  //editing listing
  async editListing() {
    this.router.navigate(['/create-listing', { listingId: this.listingId }]);
    this.ngOnDestroy();
  }

  ngOnDestroy() {
    console.log("Listing page being destroyed");
    this.list = null;
  }
}
function isMobile(): boolean {
  return window.innerWidth <= 576;
}
