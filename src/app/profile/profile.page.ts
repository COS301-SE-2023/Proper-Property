import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  appPages = [
    { title: 'Saved Listings', url: '/saved-listings', icon: 'bookmark' },
    { title: 'My Listings', url: '/my-listings', icon: 'list' },
    { title: 'Create Listing', url: '/create-listing', icon: 'add' },
    { title: 'Settings', url: '/settings', icon: 'settings' },

    // Add more pages as needed
  ];

  user = {
    email:"john@example.com",
    name: 'John',
    surname: 'Doe',
    interests: {
      garden: 50,
      mansion: 75,
      accessible: 25,
      openConcept: 90,
      ecoWarrior: 60,
    },
  };

  constructor() { }

  ngOnInit() {
  }

}
