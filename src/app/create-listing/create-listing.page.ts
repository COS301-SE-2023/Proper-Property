import { Component, OnInit } from '@angular/core';
import { signOut } from 'firebase/auth';

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
})
export class CreateListingPage implements OnInit {

  constructor() { }

  ngOnInit() {
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
          currentImages.innerHTML += "<div style='width: 200px; height: 200px;display:inline-block;'><img style='width: 100%; height: 100%'src='" + this.photos[this.photos.length - 1] + "'></img></div>&nbsp;";
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
}
