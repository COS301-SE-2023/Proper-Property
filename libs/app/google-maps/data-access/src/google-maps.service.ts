// eslint-disable-next-line
/// <reference types="@types/google.maps" />

import { Injectable, Inject } from '@angular/core';

import { API_KEY_TOKEN } from '@properproperty/app/google-maps/util';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { GetNearbyPlacesRequest, GetNearbyPlacesResponse, StoredPlaces } from '@properproperty/api/google-maps/util';


@Injectable({
  providedIn: 'root'
})
export class GmapsService {
  constructor(@Inject(API_KEY_TOKEN) private key: string
  ,private readonly functions: Functions) { }
  geocoder!: google.maps.Geocoder;
  geometry!: google.maps.GeometryLibrary;
  autocompleteService!: google.maps.places.AutocompleteService;
  nearby!: google.maps.places.PlacesService;

  //for create-listing
  setupSearchBox(elementId: string): Promise<any> {
    
    return this.loadGooglePlaces().then((maps) => {
      const defaultBounds = new maps.LatLngBounds();
  
      const input = document.getElementById(elementId) as HTMLInputElement;
  
      const options = {
        bounds: defaultBounds,
        types: ['address'],
        componentRestrictions: { country: 'ZA' },
      };
  
      this.autocompleteService = new maps.places.AutocompleteService();
  
      const searchBox = new maps.places.Autocomplete(input, options);
  
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

  getGeocoder(): Promise<google.maps.Geocoder> {
    if (this.geocoder) {
      return Promise.resolve(this.geocoder);
    }
    return this.loadGoogleMaps().then((maps) => {
      this.geocoder = new maps.Geocoder();
      return this.geocoder;
    });
  }

  // TODO refactor into using radius
  async checkAddressInArea(address1: string, listingGeometry: google.maps.LatLngLiteral): Promise<boolean> {
    return Promise.all([
      this.geocodeAddress(address1),
    ]).then(([location1]) => {
      if (location1) {
        const area1 = location1.geometry?.viewport;
        const point2 = listingGeometry;
        if (area1 && point2) {
          return area1.contains(point2);
        }
      }
      return false;
    });
  }

  geocodeAddress(address: string): Promise<google.maps.GeocoderResult | null> {
    console.warn("Geocodeing address: ", address);
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
  async handleInput(input: HTMLInputElement, defaultBounds: google.maps.LatLngBounds): Promise<void> {
    if (!this.autocompleteService) {
      return;
    }
    await this.autocompleteService.getPlacePredictions(
      {
        input: input.value,
        bounds: defaultBounds,
        types: ['address'],
        componentRestrictions: { country: 'ZA' }
      },
      (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Process the predictions here
          this.predictions = predictions.filter((prediction) => !prediction.types.includes('street_address'));
          console.log('Autocomplete predictions:', this.predictions);
        } else {
          this.predictions = [];
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
  async setupRegionSearchBox(elementId: string): Promise<any> {
    return this.loadGooglePlaces().then((maps) => {
      const defaultBounds = new maps.LatLngBounds();
  
      const input = document.getElementById(elementId) as HTMLInputElement;
  
      const options = {
        bounds: defaultBounds,
        types: ['(regions)'],
        componentRestrictions: { country: 'ZA' },
      };
  
      this.autocompleteService = new maps.places.AutocompleteService();
  
      const searchBox = new maps.places.Autocomplete(input, options);
  
      input.addEventListener('input', () => {
   
  
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
        types: ['(regions)'],
        componentRestrictions: { country: 'ZA' },
      },
      (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Filter out street addresses from the predictions
          this.regionPredictions = predictions.filter((prediction) => !prediction.types.includes('street_address'));
        } else {
          this.regionPredictions = [];
        }
      }
    );
  }
  
  filterOutStreetAddresses(predictions: google.maps.places.AutocompletePrediction[]): google.maps.places.AutocompletePrediction[] {
    return predictions.filter((prediction) => {
      // Exclude street addresses (types: 'street_address' and 'premise')
      return !prediction.types.includes('street_address');
    });
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
        this.key+ '&libraries=places,geometry';
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
        this.key +'&libraries=places,geometry&language=en&region=ZA';
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

  // getNearbyPlaces(latitude: number, longitude: number): Promise<google.maps.places.PlaceResult[]> {
  //   return this.loadGoogleMaps().then((maps) => {
  //     const service = new maps.places.PlacesService(document.createElement('div'));

  //     return new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
  //       const request = {
  //         location: new maps.LatLng(latitude, longitude),
  //         radius: 5000, // Specify the radius within which to search for nearby places (in meters)
  //       };

  //       service.nearbySearch(request, (results: google.maps.places.PlaceResult[], status: google.maps.places.PlacesServiceStatus) => {
  //         if (status === maps.places.PlacesServiceStatus.OK) {
  //           resolve(results);
  //         } else {
  //           reject('Failed to retrieve nearby places');
  //         }
  //       });
  //     });
  //   });
  // }

  async getNearbyPlaces2(listingId : string): Promise<StoredPlaces[]>{
    const response = (await httpsCallable<
      GetNearbyPlacesRequest,
      GetNearbyPlacesResponse
    >(this.functions, 'getNearbyPlaces')({listingId : listingId})).data;

    if(response.response && response.response.length > 0){
      return response.response;
    }

    return [];
  }

  getNearbySchools(latitude: number, longitude: number): Promise<google.maps.places.PlaceResult[]> {
    return this.loadGoogleMaps().then((maps) => {
      const service = new maps.places.PlacesService(document.createElement('div'));

      return new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        const request = {
          location: new maps.LatLng(latitude, longitude),
          radius: 20000, // Specify the radius within which to search for nearby places (in meters)
          keyword: 'school'
        };

        service.nearbySearch(request, (results: google.maps.places.PlaceResult[], status: google.maps.places.PlacesServiceStatus) => {
          if (status === maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject('Failed to retrieve nearby schools. Places Search responded with status: ' + status);
          }
        });
      });
    });
  }

  getNearbyPoliceStations(latitude: number, longitude: number): Promise<google.maps.places.PlaceResult[]> {
    return this.loadGoogleMaps().then((maps) => {
      const service = new maps.places.PlacesService(document.createElement('div'));

      return new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        const request = {
          location: new maps.LatLng(latitude, longitude),
          radius: 30000,
          keyword: 'police',
          rankby: 'distance'
        };
        service.nearbySearch(request, (results: google.maps.places.PlaceResult[], status: google.maps.places.PlacesServiceStatus) => {
          if (status === maps.places.PlacesServiceStatus.OK) {
            resolve(results);
            console.log("Police stations: ",results)
          } else {
            reject('Failed to retrieve nearby police stations');
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

getAddressInfo(coordinates: {latitude: number, longitude: number}): Promise<any> {
  return this.loadGoogleMaps().then((maps) => {
    const geocoder = new maps.Geocoder();
    const request = new google.maps.LatLng(coordinates.latitude, coordinates.longitude);

    geocoder.geocode({location:request}).then((response : any) =>{
      return response;
    })
  });
}
toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}
calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    //https://en.wikipedia.org/wiki/Haversine_formula
    let latDelta = this.toRad(lat2 - lat1);
    let lonDelta = this.toRad(lon2 - lon1);
    let sinLat = Math.sin(latDelta/2);
    let sinLon = Math.sin(lonDelta/2);
    // 1.42
    let _2Radius = 2 * 6378137;
    let a = sinLat * sinLat + 
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            sinLon * sinLon;

    let c = Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let d = _2Radius * c;

    return d;
}

getBoundsFromLatLng(latitude: number, longitude: number): google.maps.LatLngBounds {
  const bounds = new google.maps.LatLngBounds();
  const latLng = new google.maps.LatLng(latitude, longitude);
  bounds.extend(latLng);
  return bounds;
}




}
    