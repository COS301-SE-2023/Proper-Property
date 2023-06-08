import { Component, OnInit } from '@angular/core';
import { signOut } from 'firebase/auth';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
})
export class CreateListingPage implements OnInit {
  constructor() {

  }

  features: string[] = [];
  selectedValue: boolean = true;
  listingType: string = "";

  ngOnInit() {
    this.listingType = "Sell";
  }

  photos: string[] = [];
  count = 0;

  handleFileInput(event: any) {
    const files = event.target.files;
    if (files && files.length) {
      for (const file of files) {
        this.photos.push(URL.createObjectURL(file));
        const currentImages = document.getElementById('current-images');
        this.count++;

        if (currentImages){
          currentImages.innerHTML += "<div style='width: 10%; height: 100%;'><img class='single-image' src='" + this.photos[this.photos.length - 1] + "'></img><ion-icon name='close-circle' (click)='removeImage(" + this.count + ")'</ion-icon></div>&nbsp;";
          console.log(this.photos[this.photos.length - 1]);
          console.log(currentImages.innerHTML);
        }
      }
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

  changeListingType(){
    if(this.selectedValue){
      this.listingType = "Rent";
    }
    else{
      this.listingType = "Sell";
    }
  }

  addListing(){
    let add_in = document.getElementById('address') as HTMLInputElement;
    let price_in = document.getElementById('price') as HTMLInputElement;
    let pos_type_in = document.getElementById('pos-type') as HTMLInputElement;
    let env_type_in = document.getElementById('env-type') as HTMLInputElement;
    let prop_type_in = document.getElementById('pos-type') as HTMLInputElement;
    let furnish_type_in = document.getElementById('furnish-type') as HTMLInputElement;
    let orientation_in = document.getElementById('orientation') as HTMLInputElement;
    let floor_size_in = document.getElementById('floor-size') as HTMLInputElement;
    let property_size_in = document.getElementById('property-size') as HTMLInputElement;
    let bath_in = document.getElementById('bath') as HTMLInputElement;
    let bed_in = document.getElementById('bed') as HTMLInputElement;
    let parking_in = document.getElementById('parking') as HTMLInputElement;
    let desc_in = document.getElementById('desc') as HTMLInputElement;

    if(add_in && price_in && pos_type_in && env_type_in && prop_type_in && furnish_type_in && orientation_in && floor_size_in && property_size_in && bath_in && bed_in && parking_in && desc_in){
      let address = add_in.value;
      let price = price_in.value;
      let pos_type = pos_type_in.value;
      let env_type = env_type_in.value;
      let prop_type = prop_type_in.value;
      let furnish_type = furnish_type_in.value;
      let orientation = orientation_in.value;
      let floor_size = floor_size_in.value;
      let property_size = property_size_in.value;
      let bath = bath_in.value;
      let bed = bed_in.value;
      let parking = parking_in.value;
      let desc = desc_in.value;

      if(address != "" && price != "" && pos_type != "" && env_type != "" && prop_type != "" && furnish_type != "" && orientation != "" && floor_size != "" && property_size != "" && bath != "" && bed != "" && parking != "" && desc != ""){
        console.log("Address: " + address);
        console.log("Price: " + price);
        console.log("Position Type: " + pos_type);
        console.log("Environment Type: " + env_type);
        console.log("Property Type: " + prop_type);
        console.log("Furnish Type: " + furnish_type);
        console.log("Orientation: " + orientation);
        console.log("Floor Size: " + floor_size);
        console.log("Property Size: " + property_size);
        console.log("Bathrooms: " + bath);
        console.log("Bedrooms: " + bed);
        console.log("Parking: " + parking);
        console.log("Description: " + desc);
        console.log("Features: " + this.features);
        console.log("Photos: " + this.photos);
      }
    }
  }
}
