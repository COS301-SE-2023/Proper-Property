import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

declare const gtag: Function;

@Component({
  selector: 'properproperty-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  // constructor() {}
  constructor(public router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-4ZKFFSPB4D', { 'page_path': event.urlAfterRedirects });
        console.log("App.component: " + event.urlAfterRedirects);
      }      
    })
  }
}
