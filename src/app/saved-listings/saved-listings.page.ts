import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-saved-listings',
  templateUrl: './saved-listings.page.html',
  styleUrls: ['./saved-listings.page.scss'],
})
export class SavedListingsPage implements OnInit {
  isLiked: boolean = true;

  unlikeCard(event: any) {
    // Handle unliking logic here
    this.isLiked = false;
  }

  constructor() { }

  ngOnInit() {
  }
  isRed: boolean = false;

  toggleColor() {
    this.isRed = !this.isRed;
  }
  

}
