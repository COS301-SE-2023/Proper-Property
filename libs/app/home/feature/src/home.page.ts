import { Component, inject, OnInit,ViewChild,ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import Swiper from 'swiper';
// import { Storage, ref } from '@angular/fire/storage';
// import { uploadBytes } from 'firebase/storage';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('address', { static: true }) addressInput!: ElementRef<HTMLInputElement>;

  autocomplete: any;

  predictions: google.maps.places.AutocompletePrediction[] = [];


  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  swiperSlideChanged(e:Event) {
    console.log('changed', e)
  }

  
  public home!: string;
  private activatedRoute = inject(ActivatedRoute);
 
  constructor(
 
    public gmapsService: GmapsService) {

  }

   ngOnInit() {

    this.home = this.activatedRoute.snapshot.paramMap.get('id') as string;
    const loginBut = document.getElementById('login-button');
    const signupBut = document.getElementById('signup-button');

    
    
    const inputElementId = 'address';

    
    
    this.gmapsService.setupRegionSearchBox(inputElementId);
  }

  searchQuery = '';
  //to be implemented
  searchProperties() {
    this.searchQuery = (document.getElementById("address") as HTMLInputElement).value;
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
