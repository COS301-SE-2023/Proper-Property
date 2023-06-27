import { Component, OnInit } from '@angular/core';
import { UserService } from '@properproperty/app/user/data-access';
import { listing } from '@properproperty/app/listing/util';
import { profile } from '@properproperty/app/profile/util';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { Router } from '@angular/router';
import { OpenAIService } from '@properproperty/app/open-ai/data-access';

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
})
export class CreateListingPage implements OnInit {
  currentUser: profile | null = null;
  description: string = "";
  heading : string = "";
  constructor(public router: Router, public userService: UserService, public listingService: ListingsService, private openAIService: OpenAIService) {
    this.address=this.price=this.floor_size=this.erf_size=this.bathrooms=this.bedrooms=this.parking="";
  }

  features: string[] = [];
  selectedValue: boolean = true;
  listingType: string = "";

  ngOnInit() {
    this.listingType = "Sell";
    this.currentUser = this.userService.getCurrentUser();
  }

  photos: string[] = [];
  address: string;
  price: string;
  bathrooms:string;
  bedrooms:string;
  parking:string;
  floor_size: string;
  erf_size : string;

  count = 0;

  handleFileInput(event: any) {
    const files = event.target.files;
    if (files && files.length) {
      for (const file of files) {
        this.photos.push(URL.createObjectURL(file));
      }
    }
  }
  
  onDragOver(event: any) {
    event.preventDefault();
  }

  onDrop(event: any) {
    event.preventDefault();
    const files = event.target.files;

    for (const file of files) {
      this.photos.push(URL.createObjectURL(file));
    }

  }
  
  removeImage(index: number) {
    this.photos.splice(index, 1);
    console.log(this.photos);
  }

  selectPhotos() {
    const fileInput = document.querySelector('input[type="file"]');
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
    // Remove existing commas from the price
    this.price = this.price.replace(/,/g, '');
  
    // Format the price with commas
    this.price = this.price.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  async generateDesc(){
    let add_in = document.getElementById('address') as HTMLInputElement;
    let price_in = document.getElementById('price') as HTMLInputElement;
    let pos_type_in = document.getElementById('pos-type') as HTMLInputElement;
    let env_type_in = document.getElementById('env-type') as HTMLInputElement;
    let prop_type_in = document.getElementById('prop-type') as HTMLInputElement;
    let furnish_type_in = document.getElementById('furnish-type') as HTMLInputElement;
    let orientation_in = document.getElementById('orientation') as HTMLInputElement;
    let floor_size_in = document.getElementById('floor-size') as HTMLInputElement;
    let property_size_in = document.getElementById('property-size') as HTMLInputElement;
    let bath_in = document.getElementById('bath') as HTMLInputElement;
    let bed_in = document.getElementById('bed') as HTMLInputElement;
    let parking_in = document.getElementById('parking') as HTMLInputElement;
    
    var feats = "";
    for(var i = 0; i < this.features.length; i++){
      feats += this.features[i] + ", ";
    }

    if(add_in && price_in && pos_type_in && env_type_in && prop_type_in && furnish_type_in && orientation_in && floor_size_in && property_size_in && bath_in && bed_in && parking_in){
      let info = "Address: " + add_in.value + "\n" 
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
          console.log("OOPSIE WHOOPSIE, FUCKEY WUCKY")
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
    let feat_in = document.getElementById('feat-in') as HTMLInputElement;

    if(feat_in){
      let feat = feat_in.value;
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
    // let add_in = document.getElementById('address') as HTMLInputElement;
    // let price_in = document.getElementById('price') as HTMLInputElement;
    let pos_type_in = document.getElementById('pos-type') as HTMLInputElement;
    let env_type_in = document.getElementById('env-type') as HTMLInputElement;
    let prop_type_in = document.getElementById('prop-type') as HTMLInputElement;
    let furnish_type_in = document.getElementById('furnish-type') as HTMLInputElement;
    let orientation_in = document.getElementById('orientation') as HTMLInputElement;
    // let floor_size_in = document.getElementById('floor-size') as HTMLInputElement;
    // let property_size_in = document.getElementById('property-size') as HTMLInputElement;
    // let bath_in = document.getElementById('bath') as HTMLInputElement;
    // let bed_in = document.getElementById('bed') as HTMLInputElement;
    // let parking_in = document.getElementById('parking') as HTMLInputElement;
    let desc_in = document.getElementById('desc') as HTMLInputElement;

    console.log(prop_type_in.value);
    if(this.currentUser){
      let list : listing = {
        user_id: this.currentUser.user_id,
        address: this.address,
        price: this.price,
        pos_type: pos_type_in.value,
        env_type: env_type_in.value,
        prop_type: prop_type_in.value,
        furnish_type: furnish_type_in.value,
        orientation: orientation_in.value,
        floor_size: this.floor_size,
        property_size: this.erf_size,
        bath: this.bathrooms,
        bed: this.bedrooms,
        parking: this.parking,
        features: this.features,
        photos: this.photos,
        desc: desc_in.value,
        heading: this.heading,
        let_sell: this.listingType
      }

      console.log(list);
      await this.listingService.createListing(list);
      this.router.navigate(['/home']);
    }
    else{
      console.log("Error in create-lisitng.page.ts");
    }
  }


}

