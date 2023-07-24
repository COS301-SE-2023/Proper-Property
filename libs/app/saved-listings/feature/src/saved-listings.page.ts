import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-saved-listings',
  templateUrl: './saved-listings.page.html',
  styleUrls: ['./saved-listings.page.scss'],
})
export class SavedListingsPage implements OnInit {
  isLiked: boolean = true;

  unlikeCard(
    // event: Event
    ) {
    // Handle unliking logic here
    this.isLiked = false;
  }

  constructor() { }

  ngOnInit() {
    console.log ("Linter: Lifecycle methods should not be empty");
  }
  isRed: boolean = false;

  toggleColor() {
    this.isRed = !this.isRed;
  }
  

}
