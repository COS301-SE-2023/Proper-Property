import { Component, OnInit , ViewChild, ElementRef,HostListener} from '@angular/core';
import { UserProfileService } from '@properproperty/app/profile/data-access';
import { Listing } from '@properproperty/api/listings/util';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenAIService } from '@properproperty/app/open-ai/data-access';
import { Select} from '@ngxs/store';
import { AuthState } from '@properproperty/app/auth/data-access';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { isDevMode } from '@angular/core';
import { GmapsService } from '@properproperty/app/google-maps/data-access';

import { FormControl } from '@angular/forms';

import { map, startWith } from 'rxjs/operators'


@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
  
})
export class CreateListingPage implements OnInit {


  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;

  myControl = new FormControl();
  options: string[] = ['Angular', 'React', 'Vue', 'Ionic', 'TypeScript'];
  filteredOptions: Observable<string[]>;

  items: any[] = [];
  
  @ViewChild('address', { static: false }) addressInput!: ElementRef<HTMLInputElement>;

  @Select(AuthState.user) user$!: Observable<User | null>;
  autocomplete: any;
  defaultBounds: google.maps.LatLngBounds;
  predictions: google.maps.places.AutocompletePrediction[] = [];
  isMobile = false;
  currentUser: User | null = null;
  description = "";
  heading = "";
  ownerViewing = false;
  listingEditee : Listing | null = null;

  constructor(
    private readonly router: Router, 
    private readonly userService: UserProfileService, 
    private readonly listingService: ListingsService, 
    private readonly openAIService: OpenAIService,
    private readonly gmapsService: GmapsService,
    private readonly store: Store,
    private route: ActivatedRoute,
  ) {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );


    this.isMobile = window.innerWidth <= 576;
    
    this.address=this.price=this.floor_size=this.erf_size=this.bathrooms=this.bedrooms=this.parking="";
    this.predictions = [];
    this.defaultBounds = new google.maps.LatLngBounds();
    if (isDevMode()) {
      this.address = "378 Festival street, Hatfield, Pretoria";
      this.price = "1000000";
      this.floor_size = "100";
      this.erf_size = "100";
      this.bathrooms = "2";
      this.bedrooms = "3";
      this.parking = "1";
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
            
            console.log(this.features);
            for(let i = 0 ; i < listing.features.length ; i++){
              if(listing.features[i] == "Pool" || listing.features[i] == "Wifi" || listing.features[i] == "Pets" || listing.features[i] == "Accessible" || listing.features[i] == "Garden"){
                (document.getElementById(listing.features[i]) as HTMLIonCheckboxElement).checked = true;
                listing.features.splice(i,1);
                i--;
              }
            }
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
  selectedValue = true;
  listingType = "";
  listingAreaTypeSlider = true;
  listingAreaType = "";

 
  async ngOnInit() {
    this.listingType = "Sell";
    // this.currentUser = this.userService.getCurrentUser();
    const inputElementId = 'address';

    // this.gmapsService.setupSearchBox(inputElementId);
  }

  async handleInputChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if(input.value.length <=0){
      this.predictions = [];
      return;
    }
    await this.gmapsService.handleInput(input, this.defaultBounds);
    this.predictions = this.gmapsService.predictions;
    console.log("predictions: ", this.predictions);
    this.address= input.value;
    
    this.handleAddressChange(input.value);
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

handleAddressChange(address: string): void {
  this.address = address;
}

  photos: string[] = [];
  address = "";
  district = "";
  price = "";
  bathrooms = "";
  bedrooms = "";
  parking = "";
  floor_size = "";
  erf_size  = "";
  pos_type = "";
  env_type = "";
  prop_type = "";
  furnish_type = "";
  orientation = "";
  count = 0;


  

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
    this.price = this.price.replace(/,/g, '');
  
    // Format the price with commas
    this.price = this.price.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

  ////////////////////////////// Recommendation System Add-Ons ////////////////////////////////////////

  garden = false;
  farm = false;
  party = false;
  mansion = false;
  foreign = false;
  food = false;
  kids = false;
  students = false;
  accessible = false;
  eco = false;
  gym = false;
  owner = false;
  umbrella = false;

  touristDestinations: { lat: number, long: number }[] = [
    
    {lat:-34.176050 , long:18.342900 },
    {lat: -34.195390, long:18.448440 },
    {lat: -33.905883288483416, long:18.419559881341613 },
    {lat: -34.027445620027166, long:18.423969494340202 },
    {lat: -33.392068620368626, long:22.214438260829674 },
    {lat: -33.96514937559787, long: 23.647563426763526},
    {lat: -33.63071315123244, long: 22.16256336631636},
    {lat: -34.03129778606299, long:23.268054710171135 },
    {lat: -34.059403776473296, long: 24.925173425242086}, 
    {lat: -28.739026512440127, long: 24.75851569159852},
    {lat: -28.591087302842954, long: 20.340018582987643}, 
    {lat: -26.237620540599668, long:28.008435662716852  },
    {lat: -26.235801689082212, long:28.013123779328716 },
    {lat: -26.1559515206671, long:28.08378026658916 },
    {lat: -25.749179107587615, long: 27.89070119780269},
    {lat:-26.10722590098277 , long: 28.054846836406742},
    {lat: -26.024251206632584, long:28.01180037855904 },
    {lat: -25.77601429876691, long: 28.1757716231563}, 
    {lat: -25.966873618607902, long: 27.6625737674743},
    {lat: -26.016628111537738, long:27.7335727936381 },
    {lat: -25.357142891151142, long:27.100530200731004 },
    {lat: -25.253891585249146, long: 27.219679545822608}, 
    {lat: -29.86710808840616, long: 31.045841467231135},
    {lat: -29.846719768113445, long:31.036797371292593 }, 
    {lat: -34.07715084394336, long: 18.891699304113544}, 
    {lat: -24.572030884249113, long: 30.79878685209525},  
    {lat: -24.057146033668925, long:30.86003735206916 }, 
  ];

  async setCharacteristics()
  {
    //Garden
    this.garden = this.checkfeature("Garden");
    // Check for garden image

    //party
    if(await this.checklocationfeatures("bar", 1000) || await this.checklocationfeatures("night_club", 1000) || await this.checklocationfeatures("casino", 2000))
    {
      if(await this.checklocationfeaturesCounter("liquor_store", 1000)> 1)
      {
        this.party = true;
      }
      
    }

    //Mansion

    if(parseInt(this.floor_size) >= 2500 && parseInt(this.bedrooms)>= 4)
    {
      this.mansion = true;
    }

    //accessible
    for(const feat of this.features)
    {
      if(feat == "Accessible")
      {
        this.accessible = true;
      }
    }

    //Foreign
    if(await this.checkNearTourist())
    {
      this.foreign = true;
    }

    //eco-warrior
    this.eco = this.checkfeature("Solar Panels");

    //gym
    if(await this.checklocationfeatures("gym", 3000))
    {
      this.gym = true;
    }

    //Food
    this.food = true;
    const Dansw = this.checklocationfeaturesCounter("meal_delivery", 3000);
    console.log("Meal Delivery: ", Dansw);
    if(await Dansw < 2)
    {
      this.food = false;
    }

    const Ransw = this.checklocationfeaturesCounter("restaurant", 3000);
    console.log("Restaurants: ", Ransw);
    if(await Ransw < 3)
    {
      this.food = false;
    }

    const Cansw = this.checklocationfeaturesCounter("cafe", 3000);
    console.log("Cafes: ", Cansw);
    if(await Cansw < 1)
    {
      this.food = false;
    }

    const Tansw = this.checklocationfeaturesCounter("meal_takeaway", 3000);
    console.log("Takeawaya: ", Tansw);
    if(await Tansw < 6)
    {
      this.food = false;
    }

    //Student

    if(await this.checklocationfeatures("university", 5000))
    {
      if(parseInt(this.price) < 6000)
      {
        if(this.checkfeature("Wifi"))
        {
          this.students = true;
        }
      }
    }

    //owner
    if(this.features.length > 8 && (this.furnish_type== "Furnished"|| this.furnish_type== "Partly Furnished"))
    {
      console.log("Is an owner and ", this.furnish_type);
      this.owner = true;
    }

    //PG 13 { crime and school quality still needed }

    if(await this.checklocationfeatures("amusement_park", 10000) || await this.checklocationfeatures("aquarium", 10000) || await this.checklocationfeatures("bowling_alley", 10000) || await this.checklocationfeatures("zoo", 10000) || await this.checklocationfeatures("park", 1000) || await this.checklocationfeatures("movie_theatre", 10000))
    {
      if(await this.checklocationfeatures("school", 10000) || await this.checklocationfeatures("primary_school", 10000))
      {
        this.kids = true;
      }
    }

    //Middle of nowhere, farm

    if(await this.checkNolocationfeatures(10000))
    {
      this.farm = true;
    }


  }

  checkfeature(a : string)
  {
      for(let x =0; x< this.features.length; x++)
      {
        if(a == this.features[x])
        {
          return true;
        }
      }

      return false;
  }


  async checklocationfeatures(placeType: string, distanceFrom: number)
  {
    try {
      const coordinates = await this.gmapsService.getLatLongFromAddress(this.address);
      if (coordinates) {
        const results = await this.gmapsService.getNearbyPlaceType(
          coordinates.latitude,
          coordinates.longitude,
          placeType
        );

        console.log(results);

        for (const result of results) {
          if(result.types){
            for(const type of result.types){
              if(type == placeType){
                if(result.vicinity)
                {
                  const latlong = this.gmapsService.getLatLongFromAddress(result.vicinity);

                  const distance = await this.gmapsService.calculateDistanceInMeters(coordinates.latitude, coordinates.longitude, (await latlong).latitude, (await latlong).longitude)
                  console.log(result.name, distance, "meters away from ", this.address);
                  if(distance< distanceFrom)
                  {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error retrieving nearby places:', error);
    }
    
    return false;
  }

  async checklocationfeaturesCounter(placeType: string, distanceFrom: number)
  {
    this.count = 0;
    try {
      const coordinates = await this.gmapsService.getLatLongFromAddress(this.address);
      if (coordinates) {
        const results = await this.gmapsService.getNearbyPlaceType(
          coordinates.latitude,
          coordinates.longitude,
          placeType
        );

        console.log(results);

        for (const result of results) {
          if(result.types){
            for(const type of result.types){
              if(type == placeType){
                if(result.vicinity)
                {
                  const latlong = this.gmapsService.getLatLongFromAddress(result.vicinity);

                  const distance = await this.gmapsService.calculateDistanceInMeters(coordinates.latitude, coordinates.longitude, (await latlong).latitude, (await latlong).longitude)
                  console.log(result.name, distance, "meters away from ", this.address);
                  if(distance< distanceFrom)
                  {
                    this.count++;
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error retrieving nearby places:', error);
    }
    return this.count;
  }

  async checkNearTourist()
  {

    const coordinates = await this.gmapsService.getLatLongFromAddress(this.address);

    for(const pin of this.touristDestinations)
    {
      const distance = await this.gmapsService.calculateDistanceInMeters(coordinates.latitude, coordinates.longitude, pin.lat, pin.long)

      if(distance< 15000)
      {
        console.log("tourist coordinates:", pin.lat, pin.long);
        return true;
      }
    }

    return false;
  }

  async checkNolocationfeatures(distanceFrom: number)
  {
    try {
      const coordinates = await this.gmapsService.getLatLongFromAddress(this.address);
      if (coordinates) {
        const results = await this.gmapsService.getNearbyPlaces(
          coordinates.latitude,
          coordinates.longitude
        );

        console.log(results);

        for (const result of results) {
          if(result.types){
            for(const type of result.types){
              if(type != "cemetery" && type != "campground"){
                if(result.vicinity)
                {
                  const latlong = this.gmapsService.getLatLongFromAddress(result.vicinity);

                  const distance = await this.gmapsService.calculateDistanceInMeters(coordinates.latitude, coordinates.longitude, (await latlong).latitude, (await latlong).longitude)
                  console.log(result.name, distance, "meters away from ", this.address);
                  if(distance< distanceFrom)
                  {
                    return false;
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error retrieving nearby places:', error);
    }
    
    return true;
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  async addListing(){
    this.address = (document.getElementById("address") as HTMLInputElement).value;
   await this.setCharacteristics();

    const score = await this.calculateQualityScore(this.photos,this.address,this.price,this.bedrooms,
      this.bathrooms,this.parking,this.floor_size,this.erf_size,this.pos_type,this.env_type,
      this.prop_type,this.furnish_type,this.orientation);

      
  
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
        approved: false,
        quality_rating: score,
        characteristics: {
          garden: this.garden,
          party: this.party,
          mansion:  this.mansion,
          accessible: this.accessible,
          foreign: this.foreign,
          openConcept: false,
          ecoWarrior: this.eco,
          family: this.kids,
          student: this.students,
          lovinIt: this.food,
          farm: this.farm,
          Gym: this.gym,
          owner: this.owner,
          leftUmbrella: false 
        },
        listingDate: "" + new Date(),
        areaScore: {
          crimeScore: 0,
          schoolScore: 0,
          waterScore: 0,
          sanitationScore: 0
        }
      }

      console.log(list);
      await this.listingService.createListing(list);
      this.router.navigate(['/home']);
    }
    else{
      console.log("Error in create-lisitng.page.ts");
    }
  }

  async editListing(){
    if(this.currentUser != null && this.listingEditee != null){

      await this.setCharacteristics();

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
        approved: false,
        characteristics: {
          garden: this.garden,
          party: this.party,
          mansion:  this.mansion,
          accessible: this.accessible,
          foreign: this.foreign,
          openConcept: false,
          ecoWarrior: this.eco,
          family: this.kids,
          student: this.students,
          lovinIt: this.food,
          farm: this.farm,
          Gym: this.gym,
          owner: this.owner,
          leftUmbrella: false 
        },
        listingDate: "" + new Date(),
        areaScore: {
          crimeScore: 0,
          schoolScore: 0,
          waterScore: 0,
          sanitationScore: 0
        }
      }

      const resp = await this.listingService.editListing(list);
      if(resp){
        this.router.navigate(['/listing', {list : this.listingEditee.listing_id}]);
      }
    }
    return false
  }


  selectedAmenity = '';
  amenities: string[] = [
    'Pool',
    'Accessible',
    'Security Estate',
    'Solar Panels',
    'Flatlet',
    'Garden',
    'Pet-Friendly',
    'Wifi',
    'Solar-Panel'
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


async calculateQualityScore(photos: string[],
  address:string,
  price:string,
  bedrooms:string,
  bathrooms:string,
  parking:string,
  floor_size:string,
  erf_size:string,
  pos_type:string,
  env_type:string,
  prop_type:string,
  furnish_type:string,
  orientation:string): Promise<number>{
            
    let score = 0;
  
    for(let i = 0; i < this.min(8, photos.length); i++){
        score+= this.calculatePhotoScore(photos[i]);
    }
  
    if(this.isNumericInput(price)){
        score+= 5;
    } else score-=20;
  
    if(this.isNumericInput(bedrooms)){
        score+= 5;
    } else score-=20;
  
    if(this.isNumericInput(bathrooms)){
        score+= 5;
    } else score-=20;
  
    if(this.isNumericInput(parking)){
        score+= 5;
    } else score-=20;
  
    if(this.isNonEmptyStringInput("" + floor_size)){
        score+= 5;
    } else score-=15;
  
    if(this.isNonEmptyStringInput("" + erf_size)){
        score+= 5;
    } else score-=15;
  
    if(this.isNonEmptyStringInput("" + pos_type)){
        score+= 5;
    } else score-=15;
  
    if(this.isNonEmptyStringInput("" + env_type)){
        score+= 5;
    } else score-=15;
  
    if(this.isNonEmptyStringInput("" + prop_type)){
        score+= 5;
    } else score-=15;
  
    if(this.isNonEmptyStringInput("" + furnish_type)){
        score+= 5;
    } else score-=15;
  
    if(this.isNonEmptyStringInput("" + orientation)){
        score+= 5;
    } else score-=15;
  
  
    const geoCode = await this.checkGeocodableAddress(address);
  
    if (geoCode == null) {
      return 0;
    }
  
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


  // isMobile(): boolean {
  //   return window.innerWidth <= 576;
  // }
}