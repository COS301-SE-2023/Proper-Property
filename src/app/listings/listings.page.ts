


import { GmapsService } from '../services/gmaps.service';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

import { Router } from '@angular/router';


@Component({
  selector: 'app-listings',
  templateUrl: './listings.page.html',
  styleUrls: ['./listings.page.scss'],
})
export class ListingsPage  implements OnInit, OnDestroy  {

  @ViewChild('map', { static: true })
  mapElementRef!: ElementRef;
  googleMaps: any;
  center = { lat: -25.7477, lng: 28.2433 };
  map: any;
  mapClickListener: any;
  markerClickListener: any;
  markers: any[] = [];


  constructor(
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private actionSheetCtrl: ActionSheetController,
    private router: Router
    ) {}

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.loadMap();
  }

  async loadMap() {
    try {
      let googleMaps: any = await this.gmaps.loadGoogleMaps();
      this.googleMaps = googleMaps;
      const mapEl = this.mapElementRef.nativeElement;
      const location = new googleMaps.LatLng(this.center.lat, this.center.lng);
      this.map = new googleMaps.Map(mapEl, {
        center: location,
        zoom: 12,
      });
      this.renderer.addClass(mapEl, 'visible');
      this.addMarker(location);
      this.onMapClick();
    } catch(e) {
      console.log(e);
    }
  }

  onMapClick() {
    this.mapClickListener = this.googleMaps.event.addListener(this.map, "click", (mapsMouseEvent: { latLng: { toJSON: () => any; }; }) => {
      console.log(mapsMouseEvent.latLng.toJSON());
      this.addMarker(mapsMouseEvent.latLng);
    });
  }

  addMarker(location: any) {
    let googleMaps: any = this.googleMaps;
    const icon = {
      url: 'assets/icon/map_card.png',
      scaledSize: new googleMaps.Size(100, 50), 
    };
    const marker = new googleMaps.Marker({
      position: location,
      map: this.map,
      icon: icon,
      // draggable: true,
      animation: googleMaps.Animation.DROP
    });
    this.markers.push(marker);
    // this.presentActionSheet();
    this.markerClickListener = this.googleMaps.event.addListener(marker, 'click', () => {
      console.log('markerclick', marker);
      this.checkAndRemoveMarker(marker);
      console.log('markers: ', this.markers);
    });
  }

  checkAndRemoveMarker(marker: { position: { lat: () => any; lng: () => any; }; }) {
    const index = this.markers.findIndex(x => x.position.lat() == marker.position.lat() && x.position.lng() == marker.position.lng());
    console.log('is marker already: ', index);
    if(index >= 0) {
      this.markers[index].setMap(null);
      this.markers.splice(index, 1);
      return;
    }
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Added Marker',
      subHeader: '',
      buttons: [
        {
          text: 'Remove',
          role: 'destructive',
          data: {
            action: 'delete',
          },
        },
        {
          text: 'Save',
          data: {
            action: 'share',
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  redirectToPage() {
    this.router.navigateByUrl('/listing');
  }

  ngOnDestroy() {
    // this.googleMaps.event.removeAllListeners();
    if(this.mapClickListener) this.googleMaps.event.removeListener(this.mapClickListener);
    if(this.markerClickListener) this.googleMaps.event.removeListener(this.markerClickListener);
  }

  //likes:
  isRed: boolean = false;

  toggleColor() {
    this.isRed = !this.isRed;
  }
  

}
