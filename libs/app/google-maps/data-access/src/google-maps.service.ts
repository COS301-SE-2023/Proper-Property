// eslint-disable-next-line
/// <reference types="@types/google.maps" />

import { Injectable, Inject } from '@angular/core';

// import { environment } from 'src/environments/environment';
import { API_KEY_TOKEN } from '@properproperty/app/google-maps/util';


@Injectable({
  providedIn: 'root'
})



export class GmapsService {

  constructor(@Inject(API_KEY_TOKEN) private key: string) { }

  geocoder!: google.maps.Geocoder;

  autocompleteService!: google.maps.places.AutocompleteService;

  nearby!: google.maps.places.PlacesService;

  //for create-listing
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
        const selectedPlace = places[0];
        input.value = selectedPlace.formatted_address;
        
        // Handle the selected place(s) here
        console.log('Selected place:', places[0]);
        console.log('Eyy cousin:', input.value);
        
      });
    });
  }

  getGeocoder(): Promise<google.maps.Geocoder> {
    if (this.geocoder) {
      return Promise.resolve(this.geocoder);
    }
    return this.loadGoogleMaps().then((maps) => {
      this.geocoder = new maps.Geocoder();
      return this.geocoder;
    });
  }

  checkAddressInArea(address1: string, address2: string): Promise<boolean> {
    return Promise.all([
      this.geocodeAddress(address1),
      this.geocodeAddress(address2)
    ]).then(([location1, location2]) => {
      if (location1 && location2) {
        const area1 = location1.geometry?.viewport;
        const point2 = location2.geometry?.location;
        if (area1 && point2) {
          return area1.contains(point2);
        }
      }
      return false;
    });
  }

  geocodeAddress(address: string): Promise<google.maps.GeocoderResult | null> {
    return this.getGeocoder().then((geocoder) => {
      return new Promise<google.maps.GeocoderResult | null>((resolve, reject) => {
        geocoder.geocode({ address: address }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            resolve(results[0]);
          } else {
            reject('Failed to geocode the address');
          }
        });
      });
    });
  }

  predictions: google.maps.places.AutocompletePrediction[] = [];
  regionPredictions: google.maps.places.AutocompletePrediction[] = [];

  //for create-listing
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

  //for create-listing
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



  //for search
  getRegionPredictions(input: string, bounds: google.maps.LatLngBounds): void {
    this.autocompleteService.getPlacePredictions(
      {
        input: input,
        bounds: bounds,
        types: ['(regions)'], // Include only regions
        componentRestrictions: { country: 'ZA' } // Replace 'your_country_code' with the appropriate country code
      },
      (regionPredictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && regionPredictions) {
          this.regionPredictions = regionPredictions;
        }
      }
    );
  }
  

  //for search
  setupRegionSearchBox(elementId: string): Promise<any> {
   
    return this.loadGooglePlaces().then((maps) => {
      const defaultBounds = new maps.LatLngBounds();

      const input = document.getElementById(elementId) as HTMLInputElement;

      const searchBox = new maps.places.SearchBox(input, {
        bounds: defaultBounds,
        types: ['(regions)'],
        componentRestrictions: { country: 'ZA' }
      });

      
       maps.places.SearchBox(input, {
         bounds: defaultBounds, types: ['(regions)'], componentRestrictions: { country: 'ZA' } });
         


      this.autocompleteService = new maps.places.AutocompleteService();

      input.addEventListener('input', () => {
        console.log("bitch");
        this.handleRegionInput(input, defaultBounds);
      });

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) {
          return;
        }

        const selectedPlace = places[0];
        input.value = selectedPlace.formatted_address;
        
        // Handle the selected place(s) here
        console.log('Selected place:', places[0]);
      });
    });
  }

  handleRegionInput(input: HTMLInputElement, defaultBounds: google.maps.LatLngBounds): void {
    if (!this.autocompleteService) {
      return;
    }
    this.autocompleteService.getPlacePredictions(
      {
        input: input.value,
        bounds: defaultBounds,
        types: ['(regions)'], // Include only regions
        componentRestrictions: { country: 'ZA' } // Replace 'your_country_code' with the appropriate country code
      },
      (regionPredictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && regionPredictions) {
          // Process the predictions here
          console.log('Region predictions:', regionPredictions);
          this.regionPredictions = regionPredictions;
        }
      }
    );
  }
  

  //function for retrieving regions
  retrieveRegionFromAddress(address: string): Promise<string | null> {
    return this.loadGoogleMaps().then((maps) => {
      const geocoder = new maps.Geocoder();

      return new Promise<string | null>((resolve, reject) => {
        geocoder.geocode({ address: address }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
          if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
            const region = this.extractRegionFromGeocoderResult(results[0]);
            resolve(region);
          } else {
            reject('Failed to retrieve region from address');
          }
        });
      });
    });
  }

  private extractRegionFromGeocoderResult(result: google.maps.GeocoderResult): string | null {
    const addressComponents = result.address_components;
    for (const component of addressComponents) {
      if (component.types.includes('administrative_area_level_1')) {
        return component.long_name;
      }
    }
    return null;
  }

  //for listings
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
        5+'&libraries=places&language=en&region=ZA';
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
    }).then((maps: any) => {
      // Set the region for the Places API requests to South Africa
      maps.language = 'en';
      maps.region = 'ZA';
      return maps;
    });
  }


  getNearbyPlaces(latitude: number, longitude: number): Promise<google.maps.places.PlaceResult[]> {
    return this.loadGoogleMaps().then((maps) => {
      const service = new maps.places.PlacesService(document.createElement('div'));

      return new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        const request = {
          location: new maps.LatLng(latitude, longitude),
          radius: 1000, // Specify the radius within which to search for nearby places (in meters)
          type: ['school', 'hospital'] // Specify the types of places to search for
        };

        service.nearbySearch(request, (results: google.maps.places.PlaceResult[], status: google.maps.places.PlacesServiceStatus) => {
          if (status === maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject('Failed to retrieve nearby places');
          }
        });
      });
    });
  }

  

  
getLatLongFromAddress(address: string): Promise<{ latitude: number; longitude: number }> {
  return this.loadGoogleMaps().then((maps) => {
    const geocoder = new maps.Geocoder();

    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      geocoder.geocode({ address: address }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({ latitude: location.lat(), longitude: location.lng() });
        } else {
          reject('Failed to retrieve latitude and longitude from address');
        }
      });
    });
  });
}
  
}
    