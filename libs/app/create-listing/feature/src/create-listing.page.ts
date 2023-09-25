// eslint-disable-next-line
/// <reference types="@types/google.maps" />

import { Component , ViewChild, ElementRef,HostListener, isDevMode} from '@angular/core';
import { UserProfileService } from '@properproperty/app/profile/data-access';
import { Listing, StatusEnum } from '@properproperty/api/listings/util';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenAIService } from '@properproperty/app/open-ai/data-access';
import { Select, Store} from '@ngxs/store';
import { AuthState } from '@properproperty/app/auth/data-access';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators'


@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
  
})
export class CreateListingPage{


  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;

  myControl = new FormControl();
  options: string[] = ['Angular', 'React', 'Vue', 'Ionic', 'TypeScript'];
  filteredOptions: Observable<string[]>;

  items: any[] = [];
  
  @ViewChild('loader') scrollToElement: ElementRef | undefined;
  @ViewChild('address', { static: false }) addressInput!: ElementRef<HTMLInputElement>;

  @Select(AuthState.user) user$!: Observable<User | null>;
  // autocomplete: any;;
  maps: any;
  predictions: any[] = [];
  isMobile = false;
  currentUser: User | null = null;
  description = "";
  heading = "";
  ownerViewing = false;
  listingEditee : Listing | null = null;

  photos: string[] = [];
  address = "";
  district = "";
  price = 0;
  bathrooms = 0;
  bedrooms = 0;
  parking = 0;
  floor_size = 0;
  erf_size  = 0;
  pos_type = "";
  env_type = "";
  prop_type = "";
  furnish_type = "";
  orientation = "";
  loadingMessage = "";
  count = 0;
  geometry = {
    lat: 0,
    lng: 0
  };
  pointsOfInterestIds: string[] = [];
  listingType = "Sell";
  listingAreaType = "Rural";


  constructor(
    private readonly router: Router, 
    private readonly userService: UserProfileService, 
    private readonly listingService: ListingsService, 
    private readonly openAIService: OpenAIService,
    private readonly gmapsService: GmapsService,
    private readonly store: Store,
    private route: ActivatedRoute,
  ) {
    this.gmapsService.loadGoogleMaps().then((maps) => {
      this.maps = maps;
    });
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );


    this.isMobile = window.innerWidth <= 576;
    
    this.address="";
    this.floor_size=this.price=this.erf_size=this.bathrooms=this.bedrooms=this.parking=0;
    this.predictions = [];
    // this.defaultBounds = new google.maps.LatLngBounds();
    if (isDevMode()) {
      this.address = "123 Fake Street";
      this.price = 1000000;
      this.floor_size = 100;
      this.erf_size = 100;
      this.bathrooms = 2;
      this.bedrooms = 3;
      this.parking = 1;
      this.pos_type = "Leasehold";
      this.env_type = "Gated Community";
      this.prop_type = "House";
      this.furnish_type = "Furnished";
      this.orientation = "North";
      this.description = "This is a description";
    }
    this.user$.subscribe((user: User | null) => {
      this.currentUser =  user;
    });

    this.route.params.subscribe((params) => {
      const editListingId = params['listingId'] ?? 'XX'
      if(editListingId != 'XX'){
        this.listingService.getListing(editListingId).then((listing) => {
          this.listingEditee = listing;
          if(listing != undefined){
            this.ownerViewing = true;
            this.address = listing.address;
            this.price = listing.price;
            this.floor_size = listing.floor_size;
            this.erf_size = listing.property_size;
            this.bathrooms = listing.bath;
            this.bedrooms = listing.bed;
            this.parking = listing.parking;
            this.pos_type = listing.pos_type;
            this.env_type = listing.env_type;
            this.prop_type = listing.prop_type;
            this.furnish_type = listing.furnish_type;
            this.orientation = listing.orientation;
            this.description = listing.desc;
            this.heading = listing.heading;
            this.features = listing.features;
            this.photos = listing.photos;
            this.listingType = listing.let_sell;
            this.geometry = listing.geometry;
            this.pointsOfInterestIds = listing.pointsOfInterestIds;
            this.district = listing.district;
            this.listingAreaTypeSlider = listing.listingAreaType == "Rural" ? true : false;
            this.selectedValue = listing.let_sell == "Sell" ? true : false;
          }
        });
      }
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

@HostListener('window:resize', ['$event'])
onResize(event: Event) {
  this.isMobile = window.innerWidth <= 576;

  if(!event)
    console.log(event);
}

  features: string[] = [];

  timeout : NodeJS.Timeout | undefined;
  async handleInputChange(event: Event): Promise<void> {
    console.log("handleInput");
    this.maps = this.maps ?? await this.gmapsService.loadGoogleMaps();
    console.log(this.maps);
    // return;
    // Ur going 100 in a 60 zone, buddy
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      console.log("timeout");
      const input = event.target as HTMLInputElement;
 
      if(input.value.length <=0){
        this.predictions = [];
      }
      else {
        this.gmapsService.handleInput(input, new this.maps.LatLngBounds()).then(() => {
          this.predictions = this.gmapsService.predictions;
          // this.address = input.value;
          
          // this.handleAddressChange(input.value);
        });
      }
    }, 1500);
  }
  
  
  // replaceInputText(event: MouseEvent | undefined,prediction: string) {
  //   // this.address = prediction;
  //   //set the text in HTML element with id=hello to predictions
  //   if (event) {
  //     event.preventDefault(); // Prevent the default behavior of the <a> tag
  //   }

  //   const addressInput = document.getElementById("address") as HTMLInputElement;
  //   if (addressInput) {
  //     addressInput.value = prediction;
  //   }
  //   this.predictions = [];
  // }

  replaceInputText(event: MouseEvent | undefined, prediction: string) {
    console.log("your prediction: ",prediction);
    
    if (event) {
      event.preventDefault(); // Prevent the default behavior of the <a> tag
    }
  
    const addressInput = document.getElementById("address") as HTMLInputElement;
    if (addressInput) {
      addressInput.value = prediction;
    }
    this.predictions = [];
    
    // Update the 'address' property of the component class
    this.address = prediction;
    
  }

// handleAddressChange(address: string): void {
//    this.address = address;
// }


  handleFileInput(event: Event) {
    if (!event.currentTarget) {
      return;
    }
    const files: FileList | null = (event.currentTarget as HTMLInputElement).files;
    if (files) {
      for (let index = 0; index < files.length; index++) {
        if (files.item(index))
          this.photos.push(URL.createObjectURL(files.item(index) as Blob));
          console.log("brooo ",URL.createObjectURL(files.item(index) as Blob));
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.target) {
      return;
    }
    const files = (event.target as HTMLInputElement).files;
    
    if (files) {
      for (let index = 0; index < files.length; index++) {
        if (files.item(index))
          this.photos.push(URL.createObjectURL(files.item(index) as Blob));
      }
    }

  }
  
  removeImage(index: number) {
    this.photos.splice(index, 1);
    console.log(this.photos);
  }

  selectPhotos() {
    const fileInput = document.querySelector('input[type = "file"]');
    if (fileInput) {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: false,
        cancelable: true
      });
      fileInput.dispatchEvent(event);
    }
  }

  formatPrice() {
    this.address = (document.getElementById("address") as HTMLInputElement).value;
    // console.log("eyy cousinn...",this.address);
    // Remove existing commas from the price
    // this.price = this.price.replace(/,/g, '');
  
    // Format the price with commas
    // this.price = this.price.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  async generateDesc(){
    // const add_in = document.getElementById('address') as HTMLInputElement;
    const add_in = document.getElementById('address') as HTMLInputElement;
    const price_in = document.getElementById('price') as HTMLInputElement;
    const pos_type_in = document.getElementById('pos-type') as HTMLInputElement;
    const env_type_in = document.getElementById('env-type') as HTMLInputElement;
    const prop_type_in = document.getElementById('prop-type') as HTMLInputElement;
    const furnish_type_in = document.getElementById('furnish-type') as HTMLInputElement;
    const orientation_in = document.getElementById('orientation') as HTMLInputElement;
    const floor_size_in = document.getElementById('floor-size') as HTMLInputElement;
    const property_size_in = document.getElementById('property-size') as HTMLInputElement;
    const bath_in = document.getElementById('bath') as HTMLInputElement;
    const bed_in = document.getElementById('bed') as HTMLInputElement;
    const parking_in = document.getElementById('parking') as HTMLInputElement;


    
    let feats = "";
    for(let i = 0; i < this.features.length; i++){
      feats += this.features[i] + ", ";
    }

    if(this.address && this.price && this.pos_type && this.env_type && this.prop_type 
      && this.furnish_type && this.orientation && this.floor_size && this.erf_size 
      && this.bathrooms && this.bedrooms && this.parking){
      const info = "Address: " + add_in.value + "\n" 
      + "Price: " + price_in.value + "\n"
      + "Possession type: " + pos_type_in.value + "\n"
      + "Environment type: " + env_type_in.value + "\n"
      + "Property type: " + prop_type_in.value + "\n"
      + "Furnishing state: " + furnish_type_in.value + "\n"
      + "Orientation of the house: " + orientation_in.value + "\n"
      + "Floor size: " + floor_size_in.value + "\n"
      + "Property size: " + property_size_in.value + "\n"
      + "Number of bathrooms: " + bath_in.value + "\n"
      + "Number of bedrooms" + bed_in.value + "\n"
      + "Number of parking spots: " + parking_in.value + "\n";
      + "Features: " + feats + "\n";

      this.openAIService.descriptionCall("Give me a description of a property with the following information: \n" + info 
      + "Be as descriptive as possible such that I would want to buy the house after reading the description").then((res : string) => {
        if(res == "" || !res){
          console.log("OOPSIE WHOOPSIE, redactedEY WUCKY")
        }
        else{
          this.description = res;
        }
      });

      this.openAIService.headingCall(this.description).then((res : string) => {
        console.log(res);
        this.heading = res;
      });
    }
  }
  addFeature() {
    const feat_in = document.getElementById('feat-in') as HTMLInputElement;

    if(feat_in){
      const feat = feat_in.value;
      if(feat != ""){
        this.features.push(feat);
        feat_in.value = "";
      }
    }
  }
  //removeFeature
  removeFeature(index: number) {
    this.features.splice(index, 1);
  }

  selectedValue = true;
  listingAreaTypeSlider = true;

  changeListingType(){
    if(this.selectedValue){
      this.listingType = "Rent";
    }
    else{
      this.listingType = "Sell";
    }
  }

  changeListingAreaType(){
    if(this.listingAreaTypeSlider){
      this.listingAreaType = "Urban";
    }
    else{
      this.listingAreaType = "Rural";
    }
  }

  async addListing(creationType : string){
    this.checkGeocodableAddress(this.address).then(async (geoCode) => {
      if (geoCode == null) {     
        return;
      }
    });
    

    this.loadingMessage = creationType === "create"? "Sent for Approval" : "Saving Listing Draft";
    const property=document.querySelector('.add-property') as HTMLElement;
    const loader=document.querySelector('#loader') as HTMLElement;
    property.style.opacity="0";
    loader.style.opacity="1";
    if (this.scrollToElement && this.scrollToElement.nativeElement) {
      this.scrollToElement.nativeElement.scrollIntoView({ block: 'center' });
    }
    this.address = (document.getElementById("address") as HTMLInputElement).value;
    const score = await this.calculateQualityScore(
      this.photos,
      this.address,
      this.price,
      this.bedrooms,
      this.bathrooms,
      this.parking,
      this.floor_size,
      this.erf_size,
      this.pos_type,
      this.env_type,
      this.prop_type,
      this.furnish_type,
      this.orientation
    );
  


    if(this.currentUser != null){
      const list : Listing = {
        user_id: this.currentUser.uid,
        address: this.address,
        district: this.district,
        price: this.price,
        pos_type: this.pos_type,
        env_type: this.env_type,
        prop_type: this.prop_type,
        furnish_type: this.furnish_type,
        orientation: this.orientation,
        floor_size: this.floor_size,
        property_size: this.erf_size,
        bath: this.bathrooms,
        bed: this.bedrooms,
        parking: this.parking,
        features: this.features,
        photos: this.photos,
        desc: this.description,
        heading: this.heading,
        let_sell: this.listingType,
        listingAreaType: this.listingAreaType,
        statusChanges: [],
        quality_rating: score,
        status: creationType == "save" ? StatusEnum.SAVED : StatusEnum.PENDING_APPROVAL,
        listingDate: "" + new Date(),
        geometry: {
          lat: 0,
          lng: 0
        },
        pointsOfInterestIds: [],
        areaScore: {
          crimeScore: 0,
          schoolScore: 0,
          waterScore: 0,
          sanitationScore: 0
        }
      }

      console.log(list);

      if(creationType == "create"){
        console.log("Creating listing")
        await this.listingService.createListing(list);
      }
      else if(creationType == "save"){
        console.log("Saving listing")
        if(this.listingEditee)
          list.listing_id = this.listingEditee.listing_id;

        const response = await this.listingService.saveListing(list);
        console.log(response);
      }
      loader.style.opacity="0";
      property.style.opacity="1";
      this.router.navigate(['/home']);
    }
    else{
      console.log("Error in create-lisitng.page.ts");
    }
  }

  async editListing(){
    this.loadingMessage = "Edits Submitted for Approval";
    const property=document.querySelector('.add-property') as HTMLElement;
    const loader=document.querySelector('#loader') as HTMLElement;
    property.style.opacity="0";
    loader.style.opacity="1";
    if (this.scrollToElement && this.scrollToElement.nativeElement) {
      this.scrollToElement.nativeElement.scrollIntoView({ block: 'center' });
    }
    if(this.currentUser != null && this.listingEditee != null){
      const list : Listing = {
        listing_id: this.listingEditee.listing_id,
        statusChanges: this.listingEditee.statusChanges,
        quality_rating: this.listingEditee.quality_rating,
        user_id: this.currentUser.uid,
        address: this.address,
        district: this.district,
        price: this.price,
        pos_type: this.pos_type,
        env_type: this.env_type,
        prop_type: this.prop_type,
        furnish_type: this.furnish_type,
        orientation: this.orientation,
        floor_size: this.floor_size,
        property_size: this.erf_size,
        bath: this.bathrooms,
        bed: this.bedrooms,
        parking: this.parking,
        features: this.features,
        photos: this.photos,
        desc: this.description,
        heading: this.heading,
        let_sell: this.listingType,
        listingAreaType: this.listingAreaType,
        status: this.listingEditee.status === StatusEnum.SAVED ? StatusEnum.PENDING_APPROVAL : StatusEnum.EDITED,
        listingDate: "" + new Date(),
        geometry: {
          lat: this.geometry.lat,
          lng: this.geometry.lng
        },
        pointsOfInterestIds: this.pointsOfInterestIds,
        areaScore: {
          crimeScore: 0,
          schoolScore: 0,
          waterScore: 0,
          sanitationScore: 0
        }
      };

      const resp = await this.listingService.editListing(list);
      loader.style.opacity="0";
      property.style.opacity="1";
      if(resp){
        this.router.navigate(['/listing', {list : this.listingEditee.listing_id}]);
      }
    }
    return false
  }


  selectedAmenity = '';
  amenities: string[] = [
    'Pool',
    'Security Estate',
    'Solar panels',
    'Flatlet',
    'Garden',
    'Pet Friendly',
  ];
  filteredAmenities: string[] = [];

  handleAmenityInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value.toLowerCase();

    if (inputValue.length <= 0) {
      this.filteredAmenities = [];
      return;
    }

    this.filteredAmenities = this.amenities.filter((amenity) =>
      amenity.toLowerCase().includes(inputValue)
    );
  }

  selectAmenity(amenity: string): void {
    this.selectedAmenity = amenity;
    this.filteredAmenities = [];
  }

  async calculateQualityScore(
    photos: string[],
    address:string,
    price:number,
    bedrooms:number,
    bathrooms:number,
    parking:number,
    floor_size:number,
    erf_size:number,
    pos_type:string,
    env_type:string,
    prop_type:string,
    furnish_type:string,
    orientation:string,
  ): Promise<number>{
    let score = 0;
    if(price){
      score+= 5;
    } else score-=20;

    if(bedrooms){
      score+= 5;
    } else score-=20;

    if(bathrooms){
      score+= 5;
    } else score-=20;

    if(parking){
      score+= 5;
    } else score-=20;

    if(floor_size && floor_size > 0){
      score+= 5;
    } else score-=15;

    if(erf_size && erf_size > 0){
      score+= 5;
    } else score-=15;

    if(this.isNonEmptyStringInput(pos_type)){
      score+= 5;
    } else score-=15;

    if(this.isNonEmptyStringInput(env_type)){
      score+= 5;
    } else score-=15;

    if(this.isNonEmptyStringInput(prop_type)){
      score+= 5;
    } else score-=15;

    if(this.isNonEmptyStringInput(furnish_type)){
      score+= 5;
    } else score-=15;

    if(this.isNonEmptyStringInput(orientation)){
      score+= 5;
    } else score-=15;
  
  
    // const geoCode = await this.checkGeocodableAddress(address);
  
    // if (geoCode == null) {
    //   return 0;
    // }
  
    return score;
  }
  
  calculatePhotoScore(photo:string):number{
    let rating = 0;
    this.getImageDimensions(this.convertBlobUrlToNormalUrl(photo))
    .then(({ width, height }) => {
      rating = 5 * (this.min(width, height) / this.max(width, height));
      return rating;
    })
    .catch((error) => {
      console.error(error.message);
    });
      
    return -1;
  }
  
  min(first:number,second:number):number{
    const ret = first < second ? first : second;
    return ret;
  }
  
  max(first:number,second:number){
  return first > second ? first : second;
  }
  
  convertBlobUrlToNormalUrl(blobUrl: string): string {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = blobUrl;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context is not available.");
    }
    ctx.drawImage(img, 0, 0);
    // URL.revokeObjectURL(blobUrl); // Revoke the blob URL
    return canvas.toDataURL(); // Convert to a regular data URL
  }
  
  //   getImageDimensions(imageUrl: string): void {
  //     const image = new Image();
  //     image.src = imageUrl;
  
  //     image.onload = () => {
  //       const width = image.naturalWidth;
  //       const height = image.naturalHeight;
  
  //       console.log(`Image dimensions: ${width} x ${height} pixels`);
  //     };
  //   }
  
  async checkGeocodableAddress(address: string) {
    try {
      const geocoderResult = await this.gmapsService.geocodeAddress(address);
      return geocoderResult;
    } 
    catch (error) {
      console.error(error);

      const alert = document.createElement('ion-alert');
      alert.header = 'Error';
      alert.message = 'Please enter a valid address';
      alert.buttons = ['OK'];
  
      document.body.appendChild(alert);
      await alert.present(); // Display the alert
      return null;
    }
  }
  
  
  getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageUrl;
    
    image.onload = () => {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    
    resolve({ width, height });
    };
    
    image.onerror = () => {
    reject(new Error("Failed to load the image."));
    };
    });
  }
  
  isNumericInput(input: string): boolean {
    // Regular expression to check if the input contains only numeric characters
    const numericRegex = /^[0-9,]+$/;
    return numericRegex.test(input);
  }
  
  isNonEmptyStringInput(input: string): boolean {
    if(input){
      return input.trim() !== "";
    }
    
    return false;
  }
}