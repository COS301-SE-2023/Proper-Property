
import { Component, OnInit,HostListener } from '@angular/core';
import { UserProfileState, UserProfileService } from '@properproperty/app/profile/data-access';
import {AuthService} from '@properproperty/app/auth/data-access';
import { Logout } from '@properproperty/app/auth/util';
import { AlertController } from '@ionic/angular';

import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserProfile, Interests } from '@properproperty/api/profile/util';
import { UpdateUserProfile, RemoveCurrentUser } from '@properproperty/app/profile/util';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  isMobile:boolean;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  user: UserProfile | null = null;
  interests: Interests; // Needs to not be nullable cus ngModel no like
  isEditingEmail: boolean;
  isEditingName: boolean;
  isEditingPhoneNumber: boolean;
  newEmail: string;
  newFirstName: string;
  newLastName: string;
  newPhoneNumber: string;
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

      this.isMobile = isMobile();
    // default value cus ngModel cries when the user is null
    this.interests = {
      garden: 50,
        party: 50,
        mansion: 50,
        accessible: 50,
        foreign: 50,
        openConcept: 50,
        ecoWarrior: 50,
        family: 50,
        student: 50,
        lovinIt: 50,
        farm: 50,
        Gym: 50,
        owner: 50,
        leftUmbrella: 50
    };

    this.userProfile$.subscribe((profile) => {
      this.user = profile;
      if (profile) {
        if(profile.interests !== undefined){
          this.interests = profile.interests;
        }
      }
      else {
        this.interests = {
          garden: 50,
          party: 50,
          mansion: 50,
          accessible: 50,
          foreign: 50,
          openConcept: 50,
          ecoWarrior: 50,
          family: 50,
          student: 50,
          lovinIt: 50,
          farm: 50,
          Gym: 50,
          owner: 50,
          leftUmbrella: 50
        };
      }
    });
    
    this.isEditingEmail = false;
    this.isEditingName = false;
    this.isEditingPhoneNumber = false;
    this.newEmail = '';
    this.newFirstName = '';
    this.newLastName = '';
    this.newPhoneNumber = '';
   }

   @HostListener('window:resize', ['$event'])
   onResize(event: Event) {
     console.log(event);
     this.isMobile = window.innerWidth <= 576;
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

  logout(){
    this.store.dispatch(new RemoveCurrentUser());
    this.store.dispatch(new Logout());
    this.router.navigate(['/login']);
  }

  editName(){
    if (!this.user) {
      return;
    }
    
    this.isEditingName = true;
    this.newFirstName = this.user.firstName ?? '';
    this.newLastName = this.user.lastName ?? '';
  }

  saveName() {
    this.isEditingName = false;
    if (!this.user) {
      return;
    }
    this.user.firstName = this.newFirstName;
    this.user.lastName = this.newLastName;
    this.store.dispatch(new UpdateUserProfile({firstName: this.newFirstName, lastName: this.newLastName}));
    this.newEmail = '';
  }

  discardName() {
    this.newFirstName = '';
    this.newLastName = '';
    this.isEditingName = false;
  }

  editPhoneNumber(){
    if (!this.user) {
      return;
    }
    this.isEditingPhoneNumber = true;
    this.newPhoneNumber = this.user.phoneNumber ?? '';
  }

  savePhoneNumber() {
    this.isEditingPhoneNumber = false;
    if (!this.user) {
      return;
    }
    this.user.phoneNumber = this.newPhoneNumber;
    this.store.dispatch(new UpdateUserProfile({phoneNumber: this.newPhoneNumber}));
    this.newPhoneNumber = '';
  }

  discardPhoneNumber() {
    this.newPhoneNumber = '';
    this.isEditingPhoneNumber = false;
  }
}
function isMobile(): boolean {
  return window.innerWidth <= 576;
}