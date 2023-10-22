
import { Component, OnInit,HostListener } from '@angular/core';
import { UserProfileState, UserProfileService } from '@properproperty/app/profile/data-access';
import { AuthService} from '@properproperty/app/auth/data-access';
import { Logout } from '@properproperty/app/auth/util';
import { AlertController, ToastController, ToastOptions } from '@ionic/angular';
import { AuthState } from '@properproperty/app/auth/data-access';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserProfile, Interests } from '@properproperty/api/profile/util';
import { UpdateUserProfile, RemoveCurrentUser } from '@properproperty/app/profile/util';
import { User } from 'firebase/auth';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  isMobile:boolean;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  user: UserProfile | null = null;
  @Select(AuthState.user) userAuthSelector$!: Observable<User | null>;
  userAuth: User | null = null;
  interests: Interests; // Needs to not be nullable cus ngModel no like
  isEditingEmail: boolean;
  isEditingName: boolean;
  isEditingPhoneNumber: boolean;
  isEditingProfilePicture: boolean;
  newEmail: string;
  newFirstName: string;
  newLastName: string;
  newPhoneNumber: string;
  profilePic = "";
  saveProfile = false;
  profileComplete = false;
  googleLogged = false;
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

  async saveEmail() {
    const regex = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9]*\.[a-z]{2,6}$/;

    if (regex.test(this.newEmail)) {
      this.isEditingEmail = false;
      if (!this.user) {
        return;
      }
      this.user.email = this.newEmail;

      this.store.dispatch(new UpdateUserProfile({email: this.newEmail}));
      this.newEmail = '';
    }else{
      document.getElementById("email")?.setAttribute("style", "color: red")
      const failed = {
        message: "Please enter a valid emailaddress.",
        duration: 3000, // Duration in milliseconds
        color: 'danger', // Use 'danger' to display in red
        position: 'bottom'
      } as ToastOptions;
    
      const toast = await this.toastController.create(failed);
      toast.present();
    }
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
      private readonly store: Store,
      private readonly toastController : ToastController
    ) {
      this.isMobile = window.innerWidth <= 576;
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
        gym: 50,
        owner: 50,
        leftUmbrella: 50
    };

    this.isEditingEmail = false;
    this.isEditingName = false;
    this.isEditingPhoneNumber = false;
    this.isEditingProfilePicture = false;
    this.newEmail = '';
    this.newFirstName = '';
    this.newLastName = '';
    this.newPhoneNumber = '';
   }

   @HostListener('window:resize', ['$event'])
   onResize() {
     this.isMobile = window.innerWidth <= 576;
   }
   
  ngOnInit() {
    this.userAuthSelector$.subscribe((user) => {
      this.userAuth = user;
    });
    this.userProfile$.subscribe((profile) => {
      this.user = profile;
      this.profilePic = profile?.profilePicture ?? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2t2r3zx8jVPz6isicXtXbueLZFfWIuRMkW8X6KQ3_&s";
      this.profileComplete = false;
      if(profile?.firstName
        && profile?.lastName
        && profile?.phoneNumber
        && profile?.email
      ) {
        this.profileComplete = true;
      }
      
      if(profile) {
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
          gym: 50,
          owner: 50,
          leftUmbrella: 50
        };
      }
    });

    this.googleLogged = this.userAuth?.providerData?.[0].providerId != "password";
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

  async deleteAccount() {
    // Perform validation or additional logic here if needed
    if(this.user)
    {
      await this.userProfileService.deleteUser(this.user?.userId);
      this.authServices.deleteCurrentUser();
      //redirect to login
      this.router.navigate(['/register']);
    }
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

  async savePhoneNumber() {
    const regex = /^((\(\+27\)[1-9]([0-9]{8}))|(0[1-9]([0-9]{8})))$/;

    if (regex.test(this.newPhoneNumber)) {
      this.isEditingPhoneNumber = false;
      if (!this.user) {
        return;
      }
      this.user.phoneNumber = this.newPhoneNumber;
      this.store.dispatch(new UpdateUserProfile({phoneNumber: this.newPhoneNumber}));
      this.newPhoneNumber = '';
    } else {
        document.getElementById("phoneNumber")?.setAttribute("style", "color: red")
        const failed = {
          message: "Please enter a valid phone number. Examples include: (+27)XXXXXXXXX or 0XXXXXXXXX",
          duration: 3000, // Duration in milliseconds
          color: 'danger', // Use 'danger' to display in red
          position: 'bottom'
        } as ToastOptions;
      
        const toast = await this.toastController.create(failed);
        toast.present();
    }
  }

  discardPhoneNumber() {
    this.newPhoneNumber = '';
    this.isEditingPhoneNumber = false;
  }

  editProfilePicture(){
    if(!this.user){
      return;
    }

    this.isEditingProfilePicture = true;
  }

  handleFileInput(event: Event) {
    if (!event.currentTarget) {
      return;
    }
    const files: FileList | null = (event.currentTarget as HTMLInputElement).files;
    if (files) {
      this.saveProfile = true;
      for (let index = 0; index < files.length; index++) {
        if (files.item(index)){
          this.profilePic = URL.createObjectURL(files.item(index) as Blob);
          document.getElementById("profilePic2")?.setAttribute("style", "margin: 10px; border-radius: 50%; border: 1px solid black; width: 100px; height: 100px; background-image: url('" + this.profilePic + "'); background-size: cover; background-position-x: center; background-position-y: center;")
        }
      }
    }
  }


  async saveProfilePic(){
    if(this.user){
      await this.userProfileService.uploadProfilePic(this.user.userId, this.profilePic);
      document.getElementById("profilePic2")?.setAttribute("style", "margin: 10px; border-radius: 50%; border: 1px solid black; width: 100px; height: 100px; background-image: url('" + this.profilePic + "'); background-size: cover; background-position-x: center; background-position-y: center;")
      this.saveProfile = false;
    }
  }
}