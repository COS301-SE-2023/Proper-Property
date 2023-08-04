import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

declare const gtag: Function;

@Component({
  selector: 'properproperty-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(public router: Router, @Inject(DOCUMENT) private document: Document) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        gtag('event', 'page_view', { 
          'page_path': event.urlAfterRedirects,
          'page_location': this.document.location.href 
        });
      }      
    })
  }
}
