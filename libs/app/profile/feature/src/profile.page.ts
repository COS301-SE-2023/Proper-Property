import { Component, OnInit } from '@angular/core';
import { UserService } from '@properproperty/app/user/data-access';
import {AuthService} from '@properproperty/app/auth/data-access';
import { AlertController } from '@ionic/angular';

interface Interests {
  garden: number;
  mansion: number;
  accessible: number;
  openConcept: number;
  ecoWarrior: number;
}

import { Router } from '@angular/router';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  
  user: { name: string, surname: string, email: string, interests: Interests };
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
    this.isEditingEmail = true;
    this.newEmail = this.user.email;
  }

  saveEmail() {
    // Perform validation or additional logic here if needed
    this.user.email = this.newEmail;
    this.userServices.updateUserEmail(this.newEmail);
    this.authServices.editEmail(this.newEmail);
    this.isEditingEmail = false;
  }

  constructor( private userServices: UserService, private authServices:AuthService, private alertController: AlertController, private router: Router) {

    
    this.user = {
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

    this.user.name = this.userServices.currentUser?.first_name ?? '';
    this.user.surname = this.userServices.currentUser?.last_name ?? '';
    this.user.email = this.userServices.currentUser?.email ?? '';
    
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
    this.userServices.deleteUser(this.userServices.currentUser?.user_id ?? '');
    this.authServices.deleteCurrentUser();
    //redirect to login
    this.router.navigate(['/register']);
  }

}

