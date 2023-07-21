import { Component, OnInit } from '@angular/core';
import { UserService } from '@properproperty/app/user/data-access';
import {AuthService} from '@properproperty/app/auth/data-access';
import { AlertController } from '@ionic/angular';

import { Store } from '@ngxs/store';
import { SubscribeToAuthState } from '@properproperty/app/auth/util';
import { Select } from '@ngxs/store';
import { AuthState } from '@properproperty/app/auth/data-access';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';

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

  @Select(AuthState.user) user$!: Observable<User | null>;
  public loggedIn = false;

  
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

  constructor( private userServices: UserService, private readonly store: Store, private authServices:AuthService, private alertController: AlertController, private router: Router) {

  
      this.loggedIn = this.user$ != null && this.user$ != undefined;
  
      this.user$.subscribe((user) => {
        this.loggedIn = user != null && user != undefined;
        
        this.user.email= user?.email?? '';
        this.user.name = user?.displayName?? '';
       
      
      });
  
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
    console.log("weeh",this.user.name);
    this.user.surname = this.userServices.currentUser?.last_name ?? '';
    this.user.email = this.userServices.currentUser?.email ?? '';
    
    this.isEditingEmail = false;
    this.newEmail = '';

  
   }

  async ngOnInit() {
    console.log ("Linter: Lifecycle methods should not be empty");


    // try {
     
    //   await this.loadCurrentUser();
    //   if (!this.user) {
    //     this.router.navigate(['/login']);
    //   }
    // } catch (error) {
    //   console.error('Error getting current user:', error);
    // }
  }

  // async loadCurrentUser() {
  //   const currentUser = await this.userServices.getCurrentUser();
  //   this.user.name = currentUser?.first_name ?? '';
  //   this.user.surname = currentUser?.last_name ?? '';
  //   this.user.email = currentUser?.email ?? '';

  //   // Check if the user is logged in, if not, redirect to login page
  //   if (!currentUser) {
  //     this.router.navigate(['/login']);
  //   }
  // }

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