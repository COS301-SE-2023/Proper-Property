import { Component } from '@angular/core';
import {register} from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'home', url: '/home'},
    { title: 'login', url: '/login' },
    { title: 'profile', url: '/profile'},
    { title: 'register', url: '/register'},
    { title: 'listings', url: '/listings'},
    { title: 'search', url: '/search'},
    { title: 'create-listing', url: '/create-listing'},
    { title: 'settings', url: '/settings'},
    { title: 'version', url: '/version'},
    { title: 'loading', url: '/loading'},
    { title: 'copyright', url: '/copyright'},
    { title: '404', url: '/404'},
    { title: '500', url: '/500'},
    
  ];

  constructor() {}
}
