import { Component, OnInit , ViewChild, ElementRef} from '@angular/core';
import { UserProfileService } from '@properproperty/app/profile/data-access';
import { Listing } from '@properproperty/api/listings/util';
// import { profile } from '@properproperty/api/profile/util';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenAIService } from '@properproperty/app/open-ai/data-access';
import { Select} from '@ngxs/store';
import { AuthState } from '@properproperty/app/auth/data-access';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
// import { UpdateUserProfile } from '@properproperty/app/profile/util';
import { isDevMode } from '@angular/core';
import { GmapsService } from '@properproperty/app/google-maps/data-access';

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
})
export class CreateListingPage implements OnInit {

  @ViewChild('address', { static: true }) addressInput!: ElementRef<HTMLInputElement>;

  @Select(AuthState.user) user$!: Observable<User | null>;
  autocomplete: any;
  defaultBounds: google.maps.LatLngBounds;
  predictions: google.maps.places.AutocompletePrediction[] = [];

  currentUser: User | null = null;
  description = "";
  heading = "";
  ownerViewing : boolean = false;
  listingEditee : Listing | null = null;

  constructor(
    private readonly router: Router, 
    private readonly userService: UserProfileService, 
    private readonly listingService: ListingsService, 
    private readonly openAIService: OpenAIService,public gmapsService: GmapsService,
    private readonly store: Store,
    private route: ActivatedRoute,
  ) {
    this.address=this.price=this.floor_size=this.erf_size=this.bathrooms=this.bedrooms=this.parking="";
    this.predictions = [];
    this.defaultBounds = new google.maps.LatLngBounds();
    if (isDevMode()) {
      this.address = "123 Fake Street";
      this.price = "1000000";
      this.floor_size = "100";
      this.erf_size = "100";
      this.bathrooms = "2";
      this.bedrooms = "3";
      this.parking = "1";
      this.pos_type = "Leasehold";
      this.env_type = "Urban";
      this.prop_type = "House";
      this.furnish_type = "Furnished";
      this.orientation = "North";
      this.description = "This is a description";
    }
    this.user$.subscribe((user: User | null) => {
      this.currentUser =  user;
    });

    this.route.params.subscribe((params) => {
      let editListingId = params['listingId'] ?? 'XX'
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
          }
        });
      }
    });
  }

  features: string[] = [];
  selectedValue = true;
  listingType = "";

  async ngOnInit() {
    this.listingType = "Sell";
    // this.currentUser = this.userService.getCurrentUser();
    const inputElementId = 'address';

    this.gmapsService.setupSearchBox(inputElementId);
  }

  handleInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.gmapsService.handleInput(input, this.defaultBounds);
    this.predictions = this.gmapsService.predictions;
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

    if(add_in && price_in && pos_type_in && env_type_in && prop_type_in && furnish_type_in && orientation_in && floor_size_in && property_size_in && bath_in && bed_in && parking_in){
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

  changeListingType(){
    if(this.selectedValue){
      this.listingType = "Rent";
    }
    else{
      this.listingType = "Sell";
    }
  }

  async addListing(){
    this.address = (document.getElementById("address") as HTMLInputElement).value;
    
    const pos_type_in = document.getElementById('pos-type') as HTMLInputElement;
    const env_type_in = document.getElementById('env-type') as HTMLInputElement;
    const prop_type_in = document.getElementById('prop-type') as HTMLInputElement;
    const furnish_type_in = document.getElementById('furnish-type') as HTMLInputElement;
    const orientation_in = document.getElementById('orientation') as HTMLInputElement;
    const desc_in = document.getElementById('desc') as HTMLInputElement;

    console.log(prop_type_in.value);
    if(this.currentUser != null){
      const list : Listing = {
        user_id: this.currentUser.uid,
        address: this.address,
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
        approved: false,
        listingDate: "" + new Date()
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
      const list : Listing = {
        listing_id: this.listingEditee.listing_id,
        statusChanges: this.listingEditee.statusChanges,
        quality_rating: this.listingEditee.quality_rating,
        user_id: this.currentUser.uid,
        address: this.address,
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
        approved: false,
        listingDate: "" + new Date()
      }

      let resp = await this.listingService.editListing(list);
      if(resp){
        this.router.navigate(['/listing', {list : this.listingEditee.listing_id}]);
      }
    }
    return false
  }

}
