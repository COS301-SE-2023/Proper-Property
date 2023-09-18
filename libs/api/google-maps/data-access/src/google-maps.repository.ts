
import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { Listing, StatusChangedEvent } from '@properproperty/api/listings/util';
import { DocumentData, DocumentSnapshot, FieldValue, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Client, PlaceData, PlacesNearbyResponse, PlacesNearbyRequest, GeocodeRequest, RequestParams } from '@googlemaps/google-maps-services-js';
import { GetNearbyPlacesResponse, StoredPlaces } from '@properproperty/api/google-maps/util';
import { ListingsRepository } from '@properproperty/api/listings/data-access'
// google.maps.places.PlaceResult
// scuffed
function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

@Injectable()
export class GoogleMapsRepository {

  constructor(private readonly listingRepo: ListingsRepository){}
  private getCharacteristics = false;
  private mapsClient: Client = new Client({});
  async getPointsOfInterest(listingId: string): Promise<GetNearbyPlacesResponse> {
    const docData = (await admin
      .firestore()
      .collection('listings')
      .withConverter<Listing>({
        fromFirestore: (snapshot) => snapshot.data() as Listing,
        toFirestore: (listing: Listing) => listing
      })
      .doc(listingId)
      .get()).data();
    if (!docData?.pointsOfInterestIds) {
      console.log("Hablo no listing por favor")
      throw new Error("Hablo no listing por favor");
    }
    const pointIDs = docData.pointsOfInterestIds;

    let snapshot = await admin
      .firestore()
      .collection('pointsOfInterest')
      .where('id', 'in', pointIDs)
      .get();
    const results: StoredPlaces[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      results.push(doc.data() as StoredPlaces);
    });
    return {response: results};
  }
  
  // TODO Actually use this maybe?
  types = [
    "bar",
    "night_club",
    "casino",
    "liquor_store",
    "gym",
    "meal_delivery",
    "restaurant",
    "cafe",
    "meal_takeaway",
    "university",
    "amusement_park",
    "aquarium",
    "bowling_alley",
    "zoo",
    "park",
    "movie_theater",
    "school",
    "primary_school",
  ];
  flags = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];
  wantedTypes : string[] = [
    "airport",
    "school",
    "liquor_store",
    "atm", // so I can pay for my liquor
    "bar",
    "casino",
    "pharmacy", //for the hangover
    "car_repair", // to deal with the consequences of my actions
    "hospital", // for the liver poisoning I will have
    "cemetary", // consequences of my actions
    "laundry", // to clean up the mess
    "bakery", // for those late night munchies
    "bank", // to plead for a loan for liquour  
    "bus_station",
    "cafe",
    "church",
    "drugstore",
    "gym",
    "park",
    "shopping_mall",
    "tourist_attraction",
    "train_station",
    "university"
  ];
  docData: Listing | undefined;
  async geocodeAddress(address ?: string){
    const keeeeee = process.env['NX_GOOGLE_MAPS_KEY']
    if(!keeeeee){
      console.log("OOPSIE WHOOPSIE FUCKY WUCKY")
      return;
    }
    const request : GeocodeRequest = {
      params : {
        address: address,
        key: keeeeee
      },
    }
    return await this.mapsClient.geocode(request);
  }

  async addPOIs(event : StatusChangedEvent){
    const updates:{
      geometry?: {
        lat: number,
        lng: number,
      },
      pointsOfInterestIds: string[]
    } = {
      pointsOfInterestIds: []
    };
    console.log(GoogleMapsRepository.name, "::addPOIs 1");
    let geocode = undefined;
    this.docData = (await this.listingRepo.getListing(event.listingId)).listings[0];
    
    if (!this.docData) {
      console.log("Listing doc not found");
      return {status: false, message: "Listing doc not found"};
    }
    // I love javascript
    geocode = {
      lat: this.docData?.geometry.lat,
      lng: this.docData?.geometry.lng
    }

    if(!this.docData.geometry.lat && !this.docData.geometry.lng){
      geocode = (await this.geocodeAddress(this.docData.address))?.data.results[0].geometry.location;
      updates.geometry = {
        lat: geocode?.lat ?? 0,
        lng: geocode?.lng ?? 0
      }
      console.log("Geocode: ", geocode)
    }
    
    if(!geocode?.lat || !geocode?.lng){ // tests positive if a listing has lat/long = 0, but the oceans are rising, not receding so w/e
      console.log("Geocoding of address could not be calculated");
      return {status : false, message: "Geocoding failed, bro lives in Narnia"};
    }

    console.log(GoogleMapsRepository.name, "::addPOIs");
    const ids = this.docData?.pointsOfInterestIds ?? [];
    if(ids.length > 0){
      console.log("Points of interest already exist");
      return {status: false, message: "Points of interest found"};
    }

    console.log(GoogleMapsRepository.name, "::addPOIs 3");
    if(!process.env['NX_GOOGLE_MAPS_KEY']){
      console.log("No google maps API key");
      throw new Error("No API key found")
    }

    console.log(GoogleMapsRepository.name, "::addPOIs 4");

    console.log("requests are starting for poi")
    let response: PlacesNearbyResponse | undefined;
    let token: string | undefined;
    let pageFlag = true;
    let pageCounter = 0;
    const poiIDs : string[] = [];
    const places: Partial<PlaceData>[] = [];
    while (pageFlag && process.env['NX_RECOMMENDATION']) {
      ++pageCounter;
      pageFlag = false;
      let request: PlacesNearbyRequest = {
        params:{
          location :{
            lat: geocode.lat, 
            lng: geocode.lng
          },
          key: process.env['NX_GOOGLE_MAPS_KEY'],
          radius: 10000
        }
      }
      if (token){
        request.params['pagetoken'] = token;
      }
      try {
        response = await this.mapsClient.placesNearby(request);
      } catch (e : any) {
        console.log("NearbyPlaces Failed: ");
        console.log(e);
        return {status: false, message: e};
      }
      if (!response) {
        return {status: false, message: "Google sux"};
      }
      token = response.data.next_page_token;
      if (token) {
        console.log("But wait! There's more!");
        pageFlag = true;
        await sleep(20000);
      }
      
      response.data.results.forEach((place) => {
        if(!place.place_id || !place.types?.some((type) => this.wantedTypes.includes(type))){
          return;
        }
        place.types?.forEach((type) => {
          const index = this.types.indexOf(type);
          if (index > -1) {
            this.flags[index] = true;
          }
        });
        // TODO simplify
        poiIDs.push(place.place_id);
        places.push({
          place_id: place.place_id,
          name: place.name,
          geometry: place.geometry,
          types: place.types,
          icon: place.icon,
        });
      });
    }

    let savings = -0.032 * 3;
    for ( let x = 0; x < this.types.length; ++x) {
      let BOOl = this.flags[x];
      if (BOOl) {
        savings += 0.032;
      }
    }
    
    // TODO add characteristics to listing
    if (pageCounter >= 3 && this.getCharacteristics && process.env['NX_RECOMMENDATION']) {
      this.checkParty();
      this.checkGym();
      this.checkFood();
      this.checkUniversity();
      this.checkFamily();
    }
    
    for(let i = 0; i < this.types.length; i++) {
      console.log(this.types[i] + ": " + this.flags[i]);
    }

    console.log("Saved a grand total of: " + savings);
    updates['pointsOfInterestIds'] = poiIDs;
    await admin
    .firestore()
    .collection('listings')
    .doc(event.listingId)
    .update({
      ...updates
    });
    this.addMissingPlaces(poiIDs, places);
    return {status: true, message: "Points of interest added :thumbsupp:"};
  }

  async addMissingPlaces(ids: string[], places: Partial<PlaceData>[]) {
    const queryRes = (await admin
      .firestore()
      .collection('pointsOfinterest')
      .where('id', 'in', ids)
      .get());

    const storedIds: string[] = [];
    queryRes.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const place = doc.data() as StoredPlaces;
      storedIds.push(place.id);
    })

    places.forEach((place) => {
      if (storedIds.indexOf(place.place_id ?? "") > -1) {
        return;
      }
      this.addPlace(place);
    })
  }

  async addPlace(place: Partial<PlaceData>) {
    if (!place.place_id) {
      console.log("Place has no ID");
      return;
    }
    admin
      .firestore()
      .collection('pointsOfInterest')
      .doc(place.place_id)
      .set({
        id: place.place_id,
        name: place.name,
        geometry: place.geometry?.location,
        types: place.types,
        photos: place.icon,
      });
  }

  async checkPlaces(type: string, radius: number, size?: number): Promise<boolean> {
    size = size ?? 1;
    if (!this.docData || !process.env['NX_GOOGLE_MAPS_KEY']) {
      return false;
    }
    const request: PlacesNearbyRequest = {
      params:{
        location :{
          lat: this.docData.geometry.lat, 
          lng: this.docData.geometry.lng
        },
        radius: radius,
        key: process.env['NX_GOOGLE_MAPS_KEY'],
        type: type
      }
    };
    const response = await this.mapsClient.placesNearby(request);
    return (response.data.results.length >= size);
  }
  async checkParty() {
    // check liquor store nearby
    if (!this.flags[this.types.indexOf('liquor_store')]) {
      this.flags[this.types.indexOf('liquor_store')] = await this.checkPlaces('liquor_store', 1000);
      if (!this.flags[this.types.indexOf('liquor_store')]) {
        return;
      }
    }
    // check bar nearby
    if (this.flags[this.types.indexOf('bar')]) {
      return;
    }
    this.flags[this.types.indexOf('bar')] = await this.checkPlaces('bar', 1000);
    if (this.flags[this.types.indexOf('bar')]) {
      return;
    }
    
    // check night club nearby
    if (this.flags[this.types.indexOf('night_club')]) {
      return;
    }
    this.flags[this.types.indexOf('night_club')] = await this.checkPlaces('night_club', 1000);
    if (this.flags[this.types.indexOf('night_club')]) {
      return;
    }
    // check casino nearby
    if (this.flags[this.types.indexOf('casino')]) {
      return;
    }
    this.flags[this.types.indexOf('casino')] = await this.checkPlaces('casino', 2000);
    if (this.flags[this.types.indexOf('casino')]) {
      return;
    }
  }

  async checkGym() {
    if (this.flags[this.types.indexOf('gym')]) {
      return;
    }
    this.flags[this.types.indexOf('gym')] = await this.checkPlaces('gym', 3000);
  }

  async checkFood() {
    if (!this.flags[this.types.indexOf('meal_takeaway')]) {
      this.flags[this.types.indexOf('meal_takeaway')] = await this.checkPlaces('meal_takeaway', 3000, 6);
    }
    if (!this.flags[this.types.indexOf('meal_takeaway')]) {
      return;
    }
    
    if (!this.flags[this.types.indexOf('restaurant')]) {
      this.flags[this.types.indexOf('restaurant')] = await this.checkPlaces('restaurant', 3000, 3);
    }
    if (!this.flags[this.types.indexOf('restaurant')]) {
      return;
    }
    
    if (!this.flags[this.types.indexOf('meal_delivery')]) {
      this.flags[this.types.indexOf('meal_delivery')] = await this.checkPlaces('meal_delivery', 3000, 2);
    }
    if (!this.flags[this.types.indexOf('meal_delivery')]) {
      return;
    }
    
    if (!this.flags[this.types.indexOf('cafe')]) {
      this.flags[this.types.indexOf('cafe')] = await this.checkPlaces('cafe', 3000, 1);
    }
    if (!this.flags[this.types.indexOf('cafe')]) {
      return;
    }
  }

  async checkUniversity() {
    if (!this.flags[this.types.indexOf('university')]) {
      this.flags[this.types.indexOf('university')] = await this.checkPlaces('university', 5000);
    }
  }

  async checkFamily() {
    if (!this.flags[this.types.indexOf('school')]) {
      this.flags[this.types.indexOf('school')] = await this.checkPlaces('school', 10000);
    }
    if (!this.flags[this.types.indexOf('school')] && !this.flags[this.types.indexOf('primary_school')]) {
      this.flags[this.types.indexOf('primary_school')] = await this.checkPlaces('primary_school', 10000);
    }
    if (!this.flags[this.types.indexOf('school')] || !this.flags[this.types.indexOf('primary_school')]) {
      return;
    }

    if (!this.flags[this.types.indexOf('movie_theater')]) {
      this.flags[this.types.indexOf('movie_theater')] = await this.checkPlaces('movie_theater', 10000);
    }
    if (this.flags[this.types.indexOf('movie_theater')]) {
      return;
    }

    if (!this.flags[this.types.indexOf('park')]) {
      this.flags[this.types.indexOf('park')] = await this.checkPlaces('park', 1000);
    }
    if (this.flags[this.types.indexOf('park')]) {
      return;
    }
    
    if (!this.flags[this.types.indexOf('zoo')]) {
      this.flags[this.types.indexOf('zoo')] = await this.checkPlaces('zoo', 10000);
    }
    if (this.flags[this.types.indexOf('zoo')]) {
      return;
    }
    
    if (!this.flags[this.types.indexOf('bowling_alley')]) {
      this.flags[this.types.indexOf('bowling_alley')] = await this.checkPlaces('bowling_alley', 10000);
    }
    if (this.flags[this.types.indexOf('bowling_alley')]) {
      return;
    }
    
    if (!this.flags[this.types.indexOf('amusement_park')]) {
      this.flags[this.types.indexOf('amusement_park')] = await this.checkPlaces('amusement_park', 10000);
    }
    if (this.flags[this.types.indexOf('amusement_park')]) {
      return;
    }
    
    if (!this.flags[this.types.indexOf('aquarium')]) {
      this.flags[this.types.indexOf('aquarium')] = await this.checkPlaces('aquarium', 10000);
    }
    if (this.flags[this.types.indexOf('aquarium')]) {
      return;
    }
  }
}