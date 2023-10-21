// eslint-disable-next-line
/// <reference types="@types/google.maps" />

import { Injectable, Inject, OnInit } from '@angular/core';

import { API_KEY_TOKEN } from '@properproperty/app/google-maps/util';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { GetNearbyPlacesRequest, GetNearbyPlacesResponse, StoredPlaces } from '@properproperty/api/google-maps/util';


@Injectable({
  providedIn: 'root'
})
export class GmapsService {
  SAGeocode :  google.maps.GeocoderResult | null = null;
  constructor(
    @Inject(API_KEY_TOKEN) private key: string,
    private readonly functions: Functions
  ) {}

  // async ngOnInit(){
  //   await this.getGeocoder().then((geocoder) => {
  //     return new Promise<google.maps.GeocoderResult | null>((resolve, reject) => {
  //       geocoder.geocode({ address: "South Africa" }, (results, status) => {
  //         if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
  //           resolve(results[0]);
  //         } else {
  //           console.error('geocodeAddress results: ', results);
  //           console.error('geocodeAddress Status: ', status)
  //           reject('Failed to geocode the address');
  //         }
  //       });
  //     });
  //   });
  // }
  geocoder!: google.maps.Geocoder;
  geometry!: google.maps.GeometryLibrary;
  autocompleteService!: google.maps.places.AutocompleteService;
  nearby!: google.maps.places.PlacesService;

  timeout: NodeJS.Timeout | undefined = undefined;
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
  async checkAddressInArea(areaBounds: google.maps.LatLngBounds, listingGeometry: google.maps.LatLngLiteral): Promise<boolean> {
      const area1 = areaBounds;
      const point2 = listingGeometry;
      if (area1 && point2) {
        return area1.contains(point2);
      }
    return false;
  }
  async knockoffCheckInArea(areaBounds: google.maps.LatLngBounds, listingGeometry: google.maps.LatLngLiteral): Promise<boolean> {
    const area1 = areaBounds;
    const point2 = listingGeometry;
    if (area1 && point2) {
      const areaLatBounds = [ area1.getNorthEast().lat(), area1.getSouthWest().lat() ];
      const areaLngBounds = [ area1.getNorthEast().lng(), area1.getSouthWest().lng() ];
      console.log('areaLatBounds: ', areaLatBounds);
      console.log('areaLngBounds: ', areaLngBounds);
      const latInBounds = area1.getSouthWest().lat() <= point2.lat && point2.lat <= area1.getNorthEast().lat();
      const lngInBounds = area1.getSouthWest().lng() <= point2.lng && point2.lng <= area1.getNorthEast().lng();
      return latInBounds && lngInBounds;
    }
    return false;
  }
  async geocodeAddress(address: string): Promise<google.maps.GeocoderResult | null> {
    const geocoder = await this.getGeocoder();
    const zaBounds = await geocoder.geocode({ address: "South Africa" }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
        return results[0];
      } else {
        console.error('geocodeAddress results: ', results);
        console.error('geocodeAddress Status: ', status)
        return null;
      }
    });
    console.log("zaBounds: ", zaBounds); //https://developers.google.com/maps/documentation/javascript/reference/geocoder
    return new Promise<google.maps.GeocoderResult | null>((resolve, reject) => {
      geocoder.geocode({ address: address, bounds: zaBounds.results[0].geometry.bounds, componentRestrictions: {country: "South Africa"}}, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            console.log(results);
            for(let res of results){
              if(res.formatted_address.includes('South Africa')){
                console.log("This includes: ",  res);
                // resolve(res);
              }
            }
            console.log("South Africa Bounds: ",  this.SAGeocode);
            resolve(results[0]);
        } else {
          console.error('geocodeAddress results: ', results);
          console.error('geocodeAddress Status: ', status)
          reject('Failed to geocode the address');
        }
      });
    });
  }

  predictions: google.maps.places.AutocompletePrediction[] = [];
  regionPredictions: google.maps.places.AutocompletePrediction[] = [];

  //for create-listing
  async handleInput(input: HTMLInputElement, defaultBounds: google.maps.LatLngBounds): Promise<void> {
    if (!this.autocompleteService) {
      this.autocompleteService = new (await this.loadGoogleMaps()).places.AutocompleteService();
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
  async getRegionPredictions(input: string): Promise<void> {
    if (!this.autocompleteService) {
      // I'm sorry about this. It makes me feel gross too.
      this.autocompleteService = new (await this.loadGoogleMaps()).places.AutocompleteService();
    }
    return new Promise<void>((resolve) => {
      this.autocompleteService.getPlacePredictions({
        input: input,
        types: ['(regions)'], // Include only regions
        componentRestrictions: { country: 'ZA' } // Replace 'your_country_code' with the appropriate country code
      },
      (regionPredictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && regionPredictions) {
          this.regionPredictions = regionPredictions;
          resolve();
        }
      });
    });
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
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          if(input.value.length <=0){
            this.predictions = [];
          }
          else {
            this.handleRegionInput(input, defaultBounds); 
          }
        }, 5000);
  
        });

      searchBox.addListener('places_changed', () => {
        
        const places = searchBox.getPlaces();

        if (places.length === 0) {
          return;
        }
  
        const selectedPlace = places[0];
        input.value = selectedPlace.formatted_address;
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

  //////////////////////////////////// Added for Recomendation System: getNearbyPlace + an extra parameter///////////////
  getNearbyPlaceType(latitude: number, longitude: number, placeType: string): Promise<google.maps.places.PlaceResult[]> {
    return this.loadGoogleMaps().then((maps) => {
      const service = new maps.places.PlacesService(document.createElement('div'));

      return new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        const request = {
          location: new maps.LatLng(latitude, longitude),
          radius: 2000, // Specify the radius within which to search for nearby places (in meters) - 2000
          type: placeType,
        };

        service.nearbySearch(request, (results: google.maps.places.PlaceResult[], status: google.maps.places.PlacesServiceStatus) => {
          if (status === maps.places.PlacesServiceStatus.OK) {
            resolve(results); // Places found
          } else {
            reject('Failed to retrieve nearby places');
          }
        });
      });
    });
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
    const latDelta = this.toRad(lat2 - lat1);
    const lonDelta = this.toRad(lon2 - lon1);
    const sinLat = Math.sin(latDelta/2);
    const sinLon = Math.sin(lonDelta/2);
    // 1.42
    const _2Radius = 2 * 6378137;
    const a = sinLat * sinLat + 
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            sinLon * sinLon;

    const c = Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = _2Radius * c;

    return d;
}

getBoundsFromLatLng(latitude: number, longitude: number): google.maps.LatLngBounds {
  const bounds = new google.maps.LatLngBounds();
  const latLng = new google.maps.LatLng(latitude, longitude);
  bounds.extend(latLng);
  return bounds;
}




}
    