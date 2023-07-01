import { Injectable, Inject } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { API_KEY_TOKEN } from '@properproperty/app/google-maps/util';
@Injectable({
  providedIn: 'root'
})
export class GmapsService {

  constructor(@Inject(API_KEY_TOKEN) private key: string) { }

  loadGoogleMaps(): Promise<any> {
    const win = window as any;
    const gModule = win.google;
    if(gModule && gModule.maps) {
     return Promise.resolve(gModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=' +
        // TODO See if better way exists to hide key
        this.key;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if(loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google Map SDK is not Available');
        }
      };
    });
  }
  
}
