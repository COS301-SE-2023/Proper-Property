import { Component, inject, OnInit,ViewChild,ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '@properproperty/app/user/data-access';
import { profile } from '@properproperty/app/profile/util';
import Swiper from 'swiper';
// import { Storage, ref } from '@angular/fire/storage';
// import { uploadBytes } from 'firebase/storage';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  swiperSlideChanged(e:Event) {
    console.log('changed', e)
  }
  
  public home!: string;
  private activatedRoute = inject(ActivatedRoute);
  currentUser: profile | null = null;
  constructor(public userService : UserService) {
    this.currentUser = this.userService.getCurrentUser();
  }

   ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.home = this.activatedRoute.snapshot.paramMap.get('id') as string;
    const loginBut = document.getElementById('login-button');
    const signupBut = document.getElementById('signup-button');

    if(loginBut && signupBut){
      if(this.currentUser === null){
        console.log("Home page - onInit: Current user is null");
        loginBut.style.visibility = 'visible';
        signupBut.style.visibility = 'visible';
      }
      else{
        console.log("Home page - onInit: " + this.userService.printCurrentUser());
        loginBut.style.visibility = 'hidden';
        signupBut.style.visibility = 'hidden';
      }
    }
  }

  // swiperReady() {
  //   this.swiper = this.swiperRef?.nativeElement.swiper;
  // }

  // goNext() {
  //   this.swiper?.slideNext();
  // }
  // goPrev() {
  //   this.swiper?.slidePrev();
  // }
}
