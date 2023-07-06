/// <reference types="@types/google.maps" />
import { Injectable, Inject } from '@angular/core';

// import { environment } from 'src/environments/environment';
import { API_KEY_TOKEN } from '@properproperty/app/google-maps/util';


@Injectable({
  providedIn: 'root'
})


export class GmapsService {

  constructor(@Inject(API_KEY_TOKEN) private key: string) { }


  autocompleteService!: google.maps.places.AutocompleteService;

  setupSearchBox(elementId: string): Promise<any> {
    return this.loadGoogleMaps().then((maps) => {
      const defaultBounds = new maps.LatLngBounds();

      const input = document.getElementById(elementId) as HTMLInputElement;

      const searchBox = new maps.places.SearchBox(input, {
        bounds: defaultBounds
      });

      this.autocompleteService = new maps.places.AutocompleteService();

      input.addEventListener('input', () => {
        this.handleInput(input,defaultBounds);
      });

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) {
          return;
        }
        // Handle the selected place(s) here
        console.log('Selected place:', places[0]);
      });
    });
  }
  predictions: google.maps.places.AutocompletePrediction[] = [];


  handleInput(input: HTMLInputElement, defaultBounds: google.maps.LatLngBounds): void {
    
    if (!this.autocompleteService) {
      return;
    }
    this.autocompleteService.getPlacePredictions(
      {
        input: input.value,
        bounds: defaultBounds
      },
      (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Process the predictions here
          console.log('Autocomplete predictions:', predictions);
          this.predictions = predictions;
        }
      }
    );
  }

  getPlacePredictions(input: string, bounds: google.maps.LatLngBounds): void {
    this.autocompleteService.getPlacePredictions(
      { input: input, bounds: bounds },
      (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          this.predictions = predictions;
        }
      }
    );
  }
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


  loadGooglePlaces(): Promise<any> {
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
        this.key+'&libraries=places';
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
