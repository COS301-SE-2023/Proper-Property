import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { listing } from '../listing/interfaces/listing.interface';
import { profile } from '../profile/interfaces/profile.interface';
import { ListingsService } from '../services/listings/listings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
})
export class CreateListingPage implements OnInit {
  currentUser: profile | null = null;
  constructor(public router: Router, public userService: UserService, public listingService: ListingsService) {
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
    // let pos_type_in = document.getElementById('pos-type') as HTMLInputElement;
    let env_type_in = document.getElementById('env-type') as HTMLInputElement;
    let prop_type_in = document.getElementById('prop-type') as HTMLInputElement;
    // let furnish_type_in = document.getElementById('furnish-type') as HTMLInputElement;
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
        pos_type: "",
        env_type: env_type_in.value,
        prop_type: prop_type_in.value,
        furnish_type: "",
        orientation: orientation_in.value,
        floor_size: this.floor_size,
        property_size: this.erf_size,
        bath: this.bathrooms,
        bed: this.bedrooms,
        parking: this.parking,
        features: this.features,
        photos: this.photos,
        desc: desc_in.value,
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

