import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class PoiService {
  private apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';


  constructor(private http: HttpClient, private storage: Storage) {
    this.initStorage();
  }

  async initStorage() {
    this.storage = await this.storage.create();
  }

  getPointsOfInterest(category: string, location: { lat: number, lng: number }): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = new HttpParams()
        .set('location', `${location.lat},${location.lng}`)
        .set('radius', '5000') // Adjust the radius as per your requirement
        .set('type', category)
        .set('key', this.apiKey);

      this.http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', { params })
        .subscribe((data: any) => {
          if (data.status === 'OK') {
            resolve(data.results);
          } else {
            reject(data.status);
          }
        }, (error) => {
          reject(error);
        });
    });
  }

  saveFavoritePlace(place: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage?.get('favoritePlaces').then((places: any[]) => {
        if (places) {
          places.push(place);
          this.storage.set('favoritePlaces', places)
            .then(() => {
              resolve(undefined);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          this.storage.set('favoritePlaces', [place])
            .then(() => {
              resolve(undefined);
            })
            .catch((error: any) => {
              reject(error);
            });
        }
      });
    });
  }

  getFavoritePlaces(): Promise<any[]> {
    return this.storage.get('favoritePlaces');
  }
}
