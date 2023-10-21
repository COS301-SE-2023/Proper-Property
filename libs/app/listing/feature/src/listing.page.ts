import { Component, ElementRef, ViewChild, HostListener, AfterViewInit, OnDestroy, OnInit,Renderer2 } from '@angular/core';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { ChangeStatusResponse, Listing, StatusEnum } from '@properproperty/api/listings/util';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import { Observable, of } from 'rxjs';
import { Select } from '@ngxs/store';
import { httpsCallable, Functions } from '@angular/fire/functions';
import { Chart, registerables } from 'chart.js';
import { Unsubscribe } from 'firebase/auth';
import { IonContent, ToastOptions } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { ToastController, ActionSheetController } from '@ionic/angular';

register();
export interface GetAnalyticsDataRequest {
  listingId: string;
}
@Component({
  selector: 'app-listing',
  templateUrl: './listing.page.html',
  styleUrls: ['./listing.page.scss'],
})
export class ListingPage implements OnDestroy, OnInit, AfterViewInit {

  @ViewChild(IonContent) content: IonContent | undefined;
  // @ViewChild("avgEnagement") avgEnagement: IonInput | undefined;

  @ViewChild('map1', { static: false }) mapElementRef1!: ElementRef;
  MapView = false ;
  isMobile: boolean;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  public userProfile: UserProfile | null = null;
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
  loading = true;

  private map: any;
  googleMaps: any;

  private marker:any;
  price_per_sm = "";
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

  private center = { lat: -25.7477, lng: 28.2433 };
  private mapClickListener: any;
  private markerClickListener: any;
  private markers: any[] = [];
  public listings: Listing[] = [];
  public allListings: Listing[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private listingServices: ListingsService,
    private userServices: UserProfileService,
    private gmaps: GmapsService,
    public gmapsService: GmapsService,
    private actionSheetCtrl: ActionSheetController,
    private functions: Functions,
    private profileServices: UserProfileService,
    private toastController: ToastController
  ) {
    this.isMobile = isMobile();
    this.loanAmount = 0;
    this.interestRate = 0;
    this.loanTerm = 0;
    this.monthlyPayment = 0;
    this.totalOnceOffCosts = 0;
    this.minGrossMonthlyIncome = 0;
    Chart.register(...registerables);
  }

  async ngAfterViewInit() {
    await this.loadMap();
  }

  async ngOnInit() {
    let list_id = "";
    let admin = "";
    let qr = false;
    
    
    
    this.route.params.subscribe(async (params) => {
      list_id = params['list'];
      qr = params['qr'];
      admin = params['admin'];
      this.listingId = list_id;


      await this.listingServices.getListing(list_id).then((list) => {
        this.list = list;
      }).then(() => {
        if (admin) {
          this.admin = true;
          this.adminId = admin;
        }


        // TODO

        if (!this.list?.price || !this.list?.property_size) {
          console.error("Both Property Size and Price need to be specified");
          return
        }
        this.price_per_sm = (this.list?.price / this.list?.property_size).toFixed(2);
        this.loanAmount = this.list?.price ?? 0;
        this.loanTerm = 20;
        this.interestRate = 11.75;

        this.calculateMortgage();

        this.userServices.getUser("" + this.list?.user_id).then((user: UserProfile) => {
          this.lister = user;
          this.lister_name = user.firstName + " " + user.lastName;

          if (qr && this.list) {
            this.userServices.qrListingRead({
              address: this.list.address,
              url: window.location.href.substring(0, window.location.href.indexOf(";qr")),
              lister: this.lister,
            });
          }
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

        if (this.list?.geometry && this.list?.status == StatusEnum.ON_MARKET) {
          this.getNearbyPointsOfInterest();
          this.setCrimeScore();
          this.setSanitationScore();
          this.setSchoolRating();
          this.setWaterScore();
        }
      });
    });

    // Update listener whenever is changes such that it can be unsubscribed from
    // when the window is unloaded
    this.userProfileListener$.subscribe((listener) => {
      this.userProfileListener = listener;
    });

    setTimeout(async () => {
      this.loading = false;
    }, 1500)
  }


  async loadMap() {
    try {     
      // const mapElementRef1 = document.getElementById("map1") as HTMLElement;
  
      

      const googleMaps: any = await this.gmaps.loadGoogleMaps();
      this.googleMaps = googleMaps;
      
      let mapEl = null;
      mapEl = this.mapElementRef1.nativeElement;
        const location = new googleMaps.LatLng(this.center.lat ?? this.list?.geometry.lat, this.center.lng ?? this.list?.geometry.lat);
        this.map = new googleMaps.Map(mapEl, {
          center: location,
          zoom: 15,
          maxZoom: 18, 
          minZoom: 5,
        });
    
  
        this.renderer.addClass(mapEl, 'visible');        
      
        

        if (this.list) {
          this.createListingCard(this.list);
          if (this.list.geometry.lat && this.list.geometry.lng ) {
            const position = this.list.geometry;
            
              this.addMarker(position, this.list);
            
          }
        }
      } catch (e) {
        console.log(e);
      }
    }


    async mapView(){

      this.MapView = !this.MapView;
      if(!this.MapView) {
        const map1Element = document.getElementById("map1");
        if (map1Element) {
          map1Element.innerHTML = ''; // Clear the contents of the map1 div
        }
      }
    }
  
    addMarker(position: any, listing: Listing) {
      const googleMaps: any = this.googleMaps;
      const icon = {
        url: 'assets/icon/locationpin.png',
        scaledSize: new googleMaps.Size(40, 40), // Adjust the size of the marker icon as desired
      };
      const marker = new googleMaps.Marker({
        position: position,
        map: this.map,
        icon: icon,
        listing: listing, // Store the listing object in the marker for later use
      });
  
      // Create an info window for the marker
      const infoWindow = new googleMaps.InfoWindow({
        content: this.createListingCard(listing),
      });
      
      // Add a click event listener to the marker
      googleMaps.event.addListener(marker, 'click', () => {
        infoWindow.open(this.map, marker);
      });
  
      // Add a click event listener to the info window
      infoWindow.addListener('domready', () => {
        const infoWindowElement = document.querySelector('.marker-card');
        const dumbButton = document.querySelector('.gm-ui-hover-effect');
        if (dumbButton) {
          dumbButton.addEventListener('click', (event: Event) => {
            event.stopPropagation();
          });
          return;
        }
        if (infoWindowElement) {
          infoWindowElement.addEventListener('click', (event: Event) => {
            event.stopPropagation();
            this.mapMarkerClicked(event,infoWindowElement.getAttribute( "data-id") ?? ""); // Call the navigateToPropertyListingPage function with the marker's listing object
          });
        }
      });
  
      this.marker=marker;
    }
    mapMarkerClicked(event: Event, listingId?: string) {
      event.stopPropagation();
      if (listingId) {
        this.router.navigate(['/listing', { list: listingId }]);
      }
    }
    
    createListingCard(listing: Listing): any {
      return `
      <ion-card data-id="${listing.listing_id}"class="marker-card" style="max-width: 250px; max-height: 300px;" (click)="mapMarkerClicked($event, ${listing.listing_id})">
        <ion-card-header style="padding: 0;">
          <img src="${listing.photos[0]}" alt="Listing Image" style="max-width: 100%; max-height: 80px;">
        </ion-card-header>
        <ion-card-content style="padding: 0.5rem;">
          <ion-card-title style="font-size: 1rem; line-height: 1.2; margin-bottom: 0.5rem;">${listing.prop_type}</ion-card-title>
          <ion-card-subtitle style="color: #0DAE4F; font-size: 0.9rem; line-height: 1;">R ${listing.price}</ion-card-subtitle>
          <div id="house_details" style="font-size: 0.8rem; line-height: 1.2;">
            <img src="assets/icon/bedrooms.png" style="max-width: 7.5px; height: auto;">
            ${listing.bed}
            &nbsp; &nbsp;&nbsp;
            <img src="assets/icon/bathrooms.png" style="max-width: 7.5px; height: auto;">
            ${listing.bath}
            &nbsp; &nbsp;&nbsp;
            <img src="assets/icon/floorplan.png" style="max-width: 7.5px; height: auto;">
            ${listing.floor_size} m<sup>2</sup>
            &nbsp; &nbsp;&nbsp;
            <img src="assets/icon/erf.png" style="max-width: 7.5px; height: auto;">
            ${listing.property_size} m<sup>2</sup>
          </div>
        </ion-card-content>
      </ion-card>
    `;
    }

  
    async presentActionSheet() {
      const actionSheet = await this.actionSheetCtrl.create({
        header: 'Added Marker',
        subHeader: '',
        buttons: [
          {
            text: 'Remove',
            role: 'destructive',
            data: {
              action: 'delete',
            },
          },
          {
            text: 'Save',
            data: {
              action: 'share',
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
            data: {
              action: 'cancel',
            },
          },
        ],
      });
  
      await actionSheet.present();
    }
  
    async redirectToPage(listing: Listing) {
      this.router.navigate(['/listing', { list: listing.listing_id }]);
    }

    
  
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.location.hostname.includes("localhost")) console.log(event);
    this.isMobile = window.innerWidth <= 576;
  }

  async showAnalytics() {
    const loader = document.querySelector(".graph-animation") as HTMLElement;
    loader.style.display = "block";
    const request: GetAnalyticsDataRequest = { listingId: this.list?.listing_id ?? "" };
    const analyticsResponse = (await httpsCallable(this.functions, 'getAnalyticsData')(request)).data;
    if (typeof analyticsResponse != "string") {
      return;
    }

    const analyticsData = JSON.parse(analyticsResponse as string);
    let totUsers = 0;
    let totEngagement = 0;
    const dates: string[] = [];
    const pageViews: number[] = [];
    const obj: {
      date: string,
      pageView: number
    }[] = [];

    const rows = analyticsData.rows ?? [];
    for (let i = 0; rows && i < rows.length; i++) {
      if (rows[i]?.dimensionValues[1] && rows[i]?.metricValues[0]) {
        const dimensionValue = rows[i].dimensionValues[1].value;
        const year = Number(dimensionValue.substring(0, 4));
        const month = Number(dimensionValue.substring(4, 6));
        const day = Number(dimensionValue.substring(6, 8));


        const tempDate = new Date(year, month, day)
        const metricValue = rows[i].metricValues[0].value;

        obj.push({
          date: tempDate.getDate() + " " + this.Months[tempDate.getMonth() - 1],
          pageView: Number(metricValue)

        });

        totEngagement += Number(rows[i].metricValues[1].value);
        totUsers += Number(rows[i].metricValues[2].value);
      }
    }

    obj.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })

    for (const i of obj) {
      dates.push(i.date);
      pageViews.push(i.pageView);
    }

    // console.log(obj)

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

      // TODO proper error handling
      if (chart) {
        console.log("Chart created")
      }
    }
    const avgPerUser = totEngagement / totUsers;
    const minutes = Math.floor(avgPerUser / 60);
    const seconds = (avgPerUser - minutes * 60).toPrecision(2);

    this.avgEnagement = seconds ? minutes + " min " + seconds + " sec" : "There is no data to show yet";
    // console.log(this.avgEnagement)
    this.showData = true;
    const element = document.querySelector(".graph") as HTMLElement;
    loader.style.display = "none";
    element.style.display = "block";
    return;
  }

  successfulChange = {
    message: " successfully completed",
    duration: 3000, // Duration in milliseconds
    color: 'primary', // Use 'danger' to display in red
    position: 'bottom'
  } as ToastOptions;

  failedChange = {
    message: " failed",
    duration: 3000, // Duration in milliseconds
    color: 'danger', // Use 'danger' to display in red
    position: 'bottom'
  } as ToastOptions;

  async changeStatus(approved: boolean) {
    this.loading = true;
    // const show = document.querySelector('#show') as HTMLDivElement;
    // show.style.opacity = "0";
    // const load = document.querySelector('#loader') as HTMLElement;
    // load.style.opacity = "1";
    const runningLocally = window.location.hostname.includes("localhost");
    if (this.list && this.adminId != "") {
      let crimeScore;
      let schoolScore;
      let waterScore;
      let sanitationScore;
      const scoresCalculated = {
        crimeScore: false,
        schoolScore: false,
        waterScore: false,
        sanitationScore: false
      }
      if (!this.list.geometry.lat|| !this.list.geometry.lng) {
        const geocodeResult = await this.gmapsService.geocodeAddress(this.list.address);
        if (!geocodeResult) {
          this.loading = false;
          this.successfulChange.message = (approved? "Approval" : "Rejection") + this.failedChange.message + ": Could not geocode address";
          const toast = await this.toastController.create(this.failedChange);
          toast.present();
          return;
        }
        this.list.geometry = {
          lat: geocodeResult.geometry.location.lat() ?? 0,
          lng: geocodeResult.geometry.location.lng() ?? 0
        }
        if (runningLocally) console.log(this.list.geometry);
      }
      if ((this.list.status == StatusEnum.PENDING_APPROVAL || this.list.status == StatusEnum.EDITED) && approved) {
        if (runningLocally) console.log("Getting scores");
        
        crimeScore = this.list.areaScore.crimeScore;
        if (!crimeScore) {
          const score = await this.getCrimeScore();
          scoresCalculated.crimeScore = score > -1;
          crimeScore = Math.max(this.list.areaScore.crimeScore, score);
          if (runningLocally) console.log("crimeScore: ", score);
        }
        // schoolScore = this.list.areaScore.schoolScore ? this.list.areaScore.schoolScore: await this.getSchoolRating(this.list.geometry);
        schoolScore = this.list.areaScore.schoolScore;
        if (!schoolScore) {
          const score = await this.getSchoolRating(this.list.geometry);
          scoresCalculated.schoolScore = score > -1;
          schoolScore = Math.max(this.list.areaScore.schoolScore, score);
          if (runningLocally) console.log("schoolScore: ", score);
        }
        // waterScore = this.list.areaScore.waterScore ? this.list.areaScore.waterScore: await this.getWaterScore();
        waterScore = this.list.areaScore.waterScore;
        if (!waterScore) {
          const score = await this.getWaterScore();
          scoresCalculated.waterScore = score > -1;
          waterScore = Math.max(this.list.areaScore.waterScore, score);
          if (runningLocally) console.log("waterScore: ", score);
        }
        // sanitationScore = this.list.areaScore.sanitationScore ? this.list.areaScore.sanitationScore: await this.getSanitationScore();
        sanitationScore = this.list.areaScore.sanitationScore;
        if (!sanitationScore) {
          const score = await this.getSanitationScore();
          scoresCalculated.sanitationScore = score > -1;
          sanitationScore = Math.max(this.list.areaScore.sanitationScore, score);
          if (runningLocally) console.log("sanitationScore: ", score);
        }
      }


      let result: ChangeStatusResponse | null;
      if (
        approved
        && (this.list.status == StatusEnum.PENDING_APPROVAL || StatusEnum.EDITED)
        && (crimeScore || scoresCalculated.crimeScore)
        && (schoolScore || scoresCalculated.schoolScore)
        && (waterScore || scoresCalculated.waterScore)
        && (sanitationScore || scoresCalculated.sanitationScore)
      ) {
        // return;
        result = await this.listingServices.changeStatus("" + this.list.listing_id, this.adminId, StatusEnum.ON_MARKET, crimeScore, waterScore, sanitationScore, schoolScore);
      }
      else if ((this.list.status == StatusEnum.PENDING_APPROVAL || StatusEnum.EDITED) && approved) {
        result = await this.listingServices.changeStatus("" + this.list.listing_id, this.adminId, StatusEnum.ON_MARKET, 0, 0, 0, 0);
      }
      else if (!approved){
        // return;
        result = await this.listingServices.changeStatus(
          "" + this.list.listing_id, 
          this.adminId, 
          StatusEnum.DENIED, 
          crimeScore,
          waterScore,
          sanitationScore,
          schoolScore
        );
      }
      else {
        let failedScores = "";
        for (const [key, value] of Object.entries(scoresCalculated)) {
          if (!value) {
            failedScores += key + ", ";
          }
        }
        // remove last space and comma
        failedScores = failedScores.substring(0, failedScores.length - 2);
        this.successfulChange.message = (approved? "Approval" : "Rejection") + this.failedChange.message + ": Something went wrong during score calculation for " + failedScores;
        const toast = await this.toastController.create(this.failedChange);
        this.loading = false;
        toast.present();
        return;
      }
      if (runningLocally) console.log(result);

      setTimeout(async () => {
        this.loading = false;
      }, 2000)

      // this.loading = false;
      if (result.success) {
        this.router.navigate(['/admin']);
        this.successfulChange.message = (approved? "Approval" : "Rejection") + this.successfulChange.message;
        const toast = await this.toastController.create(this.successfulChange);
        toast.present();
        return;
      }

      this.successfulChange.message = (approved? "Approval" : "Rejection") + this.failedChange.message;
      const toast = await this.toastController.create(this.failedChange);
      toast.present();
      return;
    }
  }

  async getNearbyPointsOfInterest() {
    if (this.list?.listing_id) {
      try {
        const response = await this.gmapsService.getNearbyPlaces2(this.list.listing_id)
        response.forEach((place) => {
          let distance = -1;
          if (this.list?.geometry.lat) {
            distance = this.gmapsService.calculateDistanceInMeters(
              this.list?.geometry.lat,
              this.list?.geometry.lng,
              place.geometry.lat,
              place.geometry.lng
            );
          }
          const naam = place.name + " (" + (distance / 1000).toFixed(2) + "km)";
          this.pointsOfInterest.push({ photo: place.photos, name: naam })
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
          if (response.length > 0) {
            let totalRating = 0;
            for (let i = 0; i < response.length; i++) {
              totalRating += response[i].rating ?? 0;
            }
            return (totalRating / response.length) * 20;
          }

          return 0;
        }
      }
      catch (error) {
        console.error('Error retrieving nearby places:', error);
      }
    }

    return -1;
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
      return (response.percentage ? response.percentage : 0) * 100;
    }

    return -1;
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
      const response = await this.listingServices.getWaterScore(this.list.district
        , this.list.listingAreaType
        , this.list.prop_type
        , { lat: this.list.geometry.lat, long: this.list.geometry.lng })
      return (response.percentage ? response.percentage : 0) * 100;
    }

    return -1;
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
        return (response.percentage ? response.percentage : 0) * 100;
      }
      catch (error) {
        console.error('Error retrieving nearby places:', error);
      }
    }

    return -1;
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
    if (window.location.hostname.includes("localhost")) console.log(event);
    if (this.swiperRef) {
      this.swiperRef.nativeElement.swiper.slideNext();
    }
  }
  goPrev() {
    if (this.swiperRef) {
      this.swiperRef.nativeElement.swiper.slidePrev();
    }
  }

  swiperSlideChanged(e: Event) {
    if (window.location.hostname.includes("localhost")) console.log(e);
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

        if (this.list && this.list.characteristics) {
          this.profileServices.updateInterests(this.list.characteristics, this.userProfile.userId);
        }


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
    this.list = null;
  }

  qrGenerated = false;
  generateQRCode() {
    const QRCode = require('qrcode')
    console.log("Testing ti")
    const qrCodeCanvas = document.getElementById("qrCanvas") as HTMLCanvasElement;
    if (qrCodeCanvas) {
      QRCode.toCanvas(qrCodeCanvas, window.location.href + ";qr=true", function (error: any) {
        if (error) {
          console.error(error)
          return;
        }
      })
      this.qrGenerated = true;

      return;
    }
  }

  downloadImage() {
    const canvas = document.getElementById("qrCanvas") as HTMLCanvasElement;

    if (canvas) {
      const dataURL = canvas.toDataURL("image/png");
      // console.log(dataURL);

      const a = document.createElement('a');
      a.href = dataURL
      a.download = this.list?.address.trim().replace(/,/g, "").replace(/ /g, "-") + '-qr-download.jpeg';
      a.click();
    }
  }

  formatNumber(num: number): string {
    return num.toString().split('').reverse().join('').replace(/(\d{3})(?=\d)/g, '\$1 ').split('').reverse().join('');
  }
  
}
function isMobile(): boolean {
  return window.innerWidth <= 576;
}
