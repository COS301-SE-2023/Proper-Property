import { Component, OnInit } from '@angular/core';
import { PoiService } from '../services/poi/poi.service';

import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-poi-list',
  templateUrl: './poi-list.component.html',
  styleUrls: ['./poi-list.component.scss'],
})
export class PoiListComponent implements OnInit {
  selectedCategory: string = '';
  categories = ['hospital', 'education', 'shopping_mall', 'restaurant', 'movie_theater', 'bus_station', 'gym'];

  pois: any[] = [];

  constructor(private poiService: PoiService) { }

  ngOnInit(): void {
    this.loadPointsOfInterest('hospital');
  }

  loadPointsOfInterest(category: string): void {
    this.poiService.getPointsOfInterest(category, { lat: 37.7749, lng: -122.4194 }) // Provide the desired location coordinates
      .then((results: any[]) => {
        this.pois = results;
      })
      .catch((error) => {
        console.log('Error fetching points of interest:', error);
      });
  }

  saveFavoritePlace(place: any): void {
    this.poiService.saveFavoritePlace(place)
      .then(() => {
        console.log('Favorite place saved successfully!');
      })
      .catch((error) => {
        console.log('Error saving favorite place:', error);
      });
  }
}
