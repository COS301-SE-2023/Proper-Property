import { Component, inject, OnInit,ViewChild,ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { profile } from '../profile/interfaces/profile.interface';
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
  currentUser: profile | null;
  constructor(public userService : UserService) {
    if(this.userService.getCurrentUser()){
      this.currentUser = this.userService.getCurrentUser();
      console.log("Home page - constructor: " + this.userService.printCurrentUser());
    }
    else{
      this.currentUser = null;
      console.log("Home page - constructor: Current user is null");
    }
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.home = this.activatedRoute.snapshot.paramMap.get('id') as string;
    let loginBut = document.getElementById('login-button');

    if(loginBut){
      if(this.currentUser === null){
        console.log("Home page - onInit: Current user is null");
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