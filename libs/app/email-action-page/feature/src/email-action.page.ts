import { Component, inject, OnInit,ViewChild,ElementRef, HostListener} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileService } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import Swiper from 'swiper';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { AuthService } from '@properproperty/app/auth/data-access';
// import { LatLngBounds } from '@google/maps';

// import { Storage, ref } from '@angular/fire/storage';
// import { uploadBytes } from 'firebase/storage';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'email-action-page',
  templateUrl: './email-action.page.html',
  styleUrls: ['./email-action.page.scss'],
})
export class EmailActionPage implements OnInit{
  oobId = "";
  mode = "";
  password = "";
  confirm_password = "";
  repeatNewPassword = "";
  passwordMatch = false;
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly toastController: ToastController,
  ) {
  }

  ngOnInit() {
    console.log(this.route.snapshot.queryParams);
    this.mode = this.route.snapshot.queryParams['mode'];
    this.oobId = this.route.snapshot.queryParams['oobCode'];
  }

  async resetPassword() {
    // await this.authService.sendVerificationEmail();
    // if(!checkFields(this.email, this.password, this.confirm_password)){
    //   return;
    // }
    if (this.password !== this.confirm_password) {
      // TODO Toast
      this.toastController.create({
        message: "Passwords do not match",
        duration: 2000,
        color: "danger"
      }).then((toast) => {
        toast.present();
      });
      return;
    }
    if (!await this.authService.updatePassword(this.oobId, this.password)) {
      return;
    }
    // Present toast
    // this.toastController.create({
    //   message: "Password updated successfully",
    //   duration: 2000,
    //   color: "success"
    // }).then((toast) => {
    //   toast.present();
    // });
    // wait for 2 seconds for toast to disappear
    await new Promise(resolve => setTimeout(resolve, 2000));
    // navigate to login page
    this.router.navigate(['/login']);
  }


  strengthScore = 0;
  length = 0;
  showPassword = false;
  isStrong = false;
  lowercase = false;
  uppercase = false;
  numbers = false;
  specialchars = false;
  checkStrength(){
    this.passwordMatch =  (this.password === this.confirm_password)
      
    this.length = this.password.length;
    document.getElementById("sec1")?.setAttribute("style", "");
      document.getElementById("sec2")?.setAttribute("style", "");
      document.getElementById("sec3")?.setAttribute("style", "");
    this.strengthScore = 0;
    const upperCase = /[A-Z]{1}/;
    const lowerCase = /[a-z]{1}/;
    const numbers = /[0-9]{1}/;
    const specialChars = /[\[\].!#$%&'*+\/=?^_`{|}~-]{1}/;
    this.uppercase = upperCase.test(this.password);
    if(this.uppercase){
      console.log("uppcase");
      this.strengthScore += 2;
    }
    else{
      this.strengthScore -= 1;
    }
    this.lowercase = lowerCase.test(this.password);
    if(this.lowercase){
      console.log("lowercase");
      this.strengthScore += 2;
    }else{
      this.strengthScore -= 1;
    }
    this.numbers = numbers.test(this.password);
    if(this.numbers){
      console.log("numbers");
      this.strengthScore += 2;
    }else{
      this.strengthScore -= 1;
    }
    this.specialchars = specialChars.test(this.password);
    if(this.specialchars){
      console.log("specialChars");
      this.strengthScore += 2;
    }else{
      this.strengthScore -= 1;
    }

    if(this.length <= 5){
      this.strengthScore = 0;
    }
    else if(this.length >= 5 && this.length < 8){
      this.strengthScore += 6
    }
    else if(this.length >= 8 && this.length < 15){
      console.log("long boi")
      this.strengthScore += 10;
    }
    else if(this.length >= 15){
      this.strengthScore += 18
    }
    this.isStrong = this.length > 8 && this.uppercase && this.lowercase && this.numbers && this.specialchars;
    if(this.strengthScore <= 3){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 50%; background-color: red");
    }
    else if(this.strengthScore > 3 && this.strengthScore <= 6){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 100%; background-color: red");
    }
    else if(this.strengthScore > 6 && this.strengthScore <= 9){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 100%; background-color: red");
      document.getElementById("sec2")?.setAttribute("style", "height: 100%; width: 50%; background-color: red");
    }
    else if(this.strengthScore > 9 && this.strengthScore <= 12){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 100%; background-color: orange");
      document.getElementById("sec2")?.setAttribute("style", "height: 100%; width: 100%; background-color: orange");
    }
    else if(this.strengthScore > 12 && this.strengthScore <= 15){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 100%; background-color: orange");
      document.getElementById("sec2")?.setAttribute("style", "height: 100%; width: 100%; background-color: orange");
      document.getElementById("sec3")?.setAttribute("style", "height: 100%; width: 50%; background-color: orange");
    }
    else if(this.strengthScore > 15){
      document.getElementById("sec1")?.setAttribute("style", "height: 100%; width: 100%; background-color: green");
      document.getElementById("sec2")?.setAttribute("style", "height: 100%; width: 100%; background-color: green");
      document.getElementById("sec3")?.setAttribute("style", "height: 100%; width: 100%; background-color: green");
    }

    console.log(this.strengthScore);
  }

  showPass(){
    this.showPassword = !this.showPassword;
  }
}