import { Component, inject, OnInit,ViewChild,ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user/user.service';

import Swiper from 'swiper';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  swiperSlideChanged(e:any) {
    console.log('changed', e)
  }
  
  public home!: string;
  private activatedRoute = inject(ActivatedRoute);
  constructor(public userService : UserService) {
    console.log("Home page: " + userService.getCurrentUser());
  }

  ngOnInit() {
    this.home = this.activatedRoute.snapshot.paramMap.get('id') as string;
    let loginBut = document.getElementById('login-button');

    if(loginBut){
      if(this.userService.getCurrentUser() === null){
        console.log("Home page - onInit: " + this.userService.printCurrentUser());
        loginBut.style.visibility = 'visible';
      }
      else{
        console.log("Home page - onInit: " + this.userService.printCurrentUser());
        loginBut.style.visibility = 'hidden';
      }
    }
  }
  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  goNext() {
    this.swiper?.slideNext();
  }
  goPrev() {
    this.swiper?.slidePrev();
  }
}