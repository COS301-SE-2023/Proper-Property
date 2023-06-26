import { Component, OnInit } from '@angular/core';
import { signOut } from 'firebase/auth';
import { UserService } from '../services/user/user.service';
import { listing } from '../listing/interfaces/listing.interface';
import { profile } from '../profile/interfaces/profile.interface';
import { ListingsService } from '../services/listings/listings.service';
import { user } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
})
export class CreateListingPage implements OnInit {
  currentUser: profile | null = null;
  constructor(public router: Router, public userService: UserService, public listingService: ListingsService) {
    if(userService.getCurrentUser()){
      this.currentUser = userService.getCurrentUser();
      console.log("Create listing page: " + this.currentUser?.email + " " + this.currentUser?.first_name + " " + this.currentUser?.last_name + " " + this.currentUser?.user_id);
    }
    else{
      console.log("Create listing page: User is null");
    }
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

  async addListing(){
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

    if(this.currentUser && add_in && price_in && pos_type_in && env_type_in && prop_type_in && furnish_type_in && orientation_in && floor_size_in && property_size_in && bath_in && bed_in && parking_in && desc_in){
      let list : listing = {
        user_id: this.currentUser.user_id,
        address: add_in.value,
        price: price_in.value,
        pos_type: pos_type_in.value,
        env_type: env_type_in.value,
        prop_type: prop_type_in.value,
        furnish_type: furnish_type_in.value,
        orientation: orientation_in.value,
        floor_size: floor_size_in.value,
        property_size: property_size_in.value,
        bath: bath_in.value,
        bed: bed_in.value,
        parking: parking_in.value,
        features: this.features,
        photos: this.photos,
        desc: desc_in.value
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

