import { Component, OnInit } from '@angular/core';
import { UserProfileState, UserProfileService } from '@properproperty/app/profile/data-access';
import {AuthService} from '@properproperty/app/auth/data-access';
import { AlertController } from '@ionic/angular';

import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserProfile, Interests } from '@properproperty/api/profile/util';
import { UpdateUserProfile } from '@properproperty/app/profile/util';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  user: UserProfile | null = null;
  interests: Interests; // Needs to not be nullable cus ngModel no like
  isEditingEmail: boolean;
  newEmail: string;
  // appPages = [
  //   { title: 'Saved Listings', url: '/saved-listings', icon: 'bookmark' },
  //   { title: 'My Listings', url: '/my-listings', icon: 'list' },
  //   { title: 'Create Listing', url: '/create-listing', icon: 'add' },
  //   { title: 'Settings', url: '/settings', icon: 'settings' },

  //   // Add more pages as needed
  // ];



  
  editEmail() {
    if (!this.user) {
      return;
    }
    this.isEditingEmail = true;
    this.newEmail = this.user.email ?? '';
  }

  saveEmail() {
    this.isEditingEmail = false;
    if (!this.user) {
      return;
    }
    this.user.email = this.newEmail;
    // this.userProfileService.updateUserEmail(this.newEmail);
    // this.authServices.editEmail(this.newEmail);
    this.store.dispatch(new UpdateUserProfile({email: this.newEmail}));
    this.newEmail = '';
  }

  discardEmail() {
    this.newEmail = '';
    this.isEditingEmail = false;
  }

  constructor( 
      private readonly userProfileService: UserProfileService, 
      private readonly authServices:AuthService, 
      private readonly alertController: AlertController, 
      private readonly router: Router,
      private readonly store: Store
    ) {

    // default value cus ngModel cries when the user is null
    this.interests = {
      garden: 0,
      mansion: 0,
      accessible: 0,
      openConcept: 0,
      ecoWarrior: 0,
    };

    this.userProfile$.subscribe((profile) => {
      this.user = profile;
      if (profile) {
      //   this.interests = profile.interests;
        console.log(profile);
      }
      else {
        this.interests = {
          garden: 50,
          mansion: 20,
          accessible: 60,
          openConcept: 90,
          ecoWarrior: 75,
        };
      }
    });

    // this.user = {
    //   email:"john@example.com",
    //   name: 'John',
    //   surname: 'Doe',
    //   interests: {
    //     garden: 50,
    //     mansion: 75,
    //     accessible: 25,
    //     openConcept: 90,
    //     ecoWarrior: 60,
    //   },
    // };
    
    this.isEditingEmail = false;
    this.newEmail = '';

  
   }

  ngOnInit() {
    console.log ("Linter: Lifecycle methods should not be empty");
  }
  async confirmDeleteAccount() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Are you sure you want to delete your account?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Delete account canceled');
          }
        },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: () => {
            this.deleteAccount();
          }
        }
      ]
    });

    await alert.present();
  }

  deleteAccount() {
    // Perform validation or additional logic here if needed
    this.userProfileService.deleteUser(this.userProfileService.currentUser?.userId ?? '');
    this.authServices.deleteCurrentUser();
    //redirect to login
    this.router.navigate(['/register']);
  }

}