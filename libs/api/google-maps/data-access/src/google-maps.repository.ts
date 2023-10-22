
import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { Listing, StatusChangedEvent, characteristics } from '@properproperty/api/listings/util';
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Client, PlaceData, PlacesNearbyResponse, PlacesNearbyRequest, GeocodeRequest } from '@googlemaps/google-maps-services-js';
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
  private getCharacteristics = true;
  private mapsClient: Client = new Client({});
  private poiIDs: string[] = [];
  private places: Partial<PlaceData>[] = [];
  private storedPlaces: StoredPlaces[] = [];
  private recalculating = false;
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
      throw new Error("No listings were found");
    }
    const pointIDs = docData.pointsOfInterestIds ?? [];
    if (pointIDs.length == 0) {
      return { response: []};
    }
    const response2 = new Promise<GetNearbyPlacesResponse>(async (resolve) => {
      const results: StoredPlaces[] = [];
      for (let startIndex = 0; startIndex < pointIDs.length; startIndex += 30) {

        const queryRes = (await admin
          .firestore()
          .collection('pointsOfInterest')
          .where('id', 'in', pointIDs.slice(startIndex, Math.min(startIndex+ 29, pointIDs.length)))
          .get());

        queryRes.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const place = doc.data() as StoredPlaces;
          results.push(place);
        })
      }
      resolve({response: results});
    });

    return (response2);
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
    "university",
    "primary_school",
    "restaurant",
    "night_club",
    "meal_delivery",
    "meal_takeaway",
    "amusement_park",
    "aquarium",
    "bowling_alley",
    "zoo",
    "movie_theater",
  ];
  
  garden = false;
  farm = false;
  party = false;
  mansion = false;
  foreign = false;
  food = false;
  kids = false;
  students = false;
  accessible = false;
  eco = false;
  gym = false;
  owner = false;
  // TODO use this?
  umbrella = false;
  // foodTypecounts = {
  //   "restaurant": 0,
  //   "cafe": 0,
  //   "meal_takeaway": 0,
  //   "meal_delivery": 0,
  // }
  touristDestinations: { lat: number, long: number }[] = [
    {lat:-34.176050 , long:18.342900 },
    {lat: -34.195390, long:18.448440 },
    {lat: -33.905883288483416, long:18.419559881341613 },
    {lat: -34.027445620027166, long:18.423969494340202 },
    {lat: -33.392068620368626, long:22.214438260829674 },
    {lat: -33.96514937559787, long: 23.647563426763526},
    {lat: -33.63071315123244, long: 22.16256336631636},
    {lat: -34.03129778606299, long:23.268054710171135 },
    {lat: -34.059403776473296, long: 24.925173425242086}, 
    {lat: -28.739026512440127, long: 24.75851569159852},
    {lat: -28.591087302842954, long: 20.340018582987643}, 
    {lat: -26.237620540599668, long:28.008435662716852  },
    {lat: -26.235801689082212, long:28.013123779328716 },
    {lat: -26.1559515206671, long:28.08378026658916 },
    {lat: -25.749179107587615, long: 27.89070119780269},
    {lat:-26.10722590098277 , long: 28.054846836406742},
    {lat: -26.024251206632584, long:28.01180037855904 },
    {lat: -25.77601429876691, long: 28.1757716231563}, 
    {lat: -25.966873618607902, long: 27.6625737674743},
    {lat: -26.016628111537738, long:27.7335727936381 },
    {lat: -25.357142891151142, long:27.100530200731004 },
    {lat: -25.253891585249146, long: 27.219679545822608}, 
    {lat: -29.86710808840616, long: 31.045841467231135},
    {lat: -29.846719768113445, long:31.036797371292593 }, 
    {lat: -34.07715084394336, long: 18.891699304113544}, 
    {lat: -24.572030884249113, long: 30.79878685209525},  
    {lat: -24.057146033668925, long:30.86003735206916 }, 
  ];

  docData: Listing | undefined;
  geometry: {
    lat: number,
    lng: number
  } | undefined = undefined;
  async geocodeAddress(address ?: string){
    const keeeeee = process.env['NX_GOOGLE_MAPS_KEY'];
    if(!keeeeee){
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
    if (!process.env['NX_GOOGLE_MAPS_KEY']) {
      return;
    }
    const updates:{
      geometry?: {
        lat: number,
        lng: number,
      },
      pointsOfInterestIds: string[],
      characteristics?: characteristics
    } = {
      pointsOfInterestIds: []
    };
    this.geometry = undefined;
    this.docData = (await this.listingRepo.getListing(event.listingId)).listings[0];
    if (!this.docData?.listing_id) {
      return {status: false, message: "Listing doc not found"};
    }
    // I love javascript
    this.geometry = {
      lat: this.docData?.geometry.lat,
      lng: this.docData?.geometry.lng
    }

    if(!this.docData.geometry.lat && !this.docData.geometry.lng){
      this.geometry = (await this.geocodeAddress(this.docData.address))?.data.results[0].geometry.location;
      updates.geometry = {
        lat: this.geometry?.lat ?? 0,
        lng: this.geometry?.lng ?? 0
      }
    }
    
    if(!this.geometry?.lat || !this.geometry?.lng){ // tests positive if a listing has lat/long = 0, but the oceans are rising, not receding so w/e
      return {status : false, message: "Geocoding failed, bro lives in Narnia"};
    }

    const ids = this.docData?.pointsOfInterestIds ?? [];
    if(ids.length > 0){
      this.recalculating = true;
      this.storedPlaces = (await this.getPointsOfInterest(this.docData.listing_id)).response ?? [];
      // Should always be the case but type wrangling
      if (this.storedPlaces.length > 0) {
        await this.recalculateCharacteristicsOnly();
      }
      return {status: false, message: "Points of interest found, and characteristcs recalculated"};
    }

    if(!process.env['NX_GOOGLE_MAPS_KEY']){
      throw new Error("No API key found")
    }

    let response: PlacesNearbyResponse | undefined;
    let token: string | undefined;
    let pageFlag = true;
    let pageCounter = 0; // fail-safe
    this.places = [];
    this.poiIDs = [];
    while (pageFlag && pageCounter < 3) {
      ++pageCounter;
      pageFlag = false;
      const request: PlacesNearbyRequest = {
        params:{
          location :{
            lat: this.geometry.lat, 
            lng: this.geometry.lng
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
      } catch (e) {
        return {status: false, message: e};
      }
      if (!response) {
        return {status: false, message: "Google sux"};
      }
      token = response.data.next_page_token;
      if (token) {
        pageFlag = true;
        await sleep(10000);
      }
      await this.filterUnwantedPlaces(response.data.results);
    }
    // TODO set "middle of nowhere" if no POIS added after loop
    this.farm = this.poiIDs.length == 0 && this.docData.property_size >= 10000;

    let savings = -0.032 * 3;
    for ( let x = 0; x < this.types.length && process.env['NX_ENVIRONMENT']; ++x) {
      const BOOl = this.flags[x];
      if (BOOl) {
        savings += 0.032;
      }
    }
    if (process.env['NX_RECOMMENDATION']) {
      const listing = this.docData;
      this.garden = listing.features.indexOf("Garden") > -1;

      // TODO Mansion
      if(listing.floor_size >= 2500 && listing.bed>= 4){
        this.mansion = true;
      }
      
      // TODO accessible
      if(listing.features.indexOf("Accessible") > -1){
        this.accessible = true;
      }

      // TODO Foreign
        for (const touristLocation of this.touristDestinations) {
          const distance = this.calculateDistanceInMeters(
            listing.geometry.lat, 
            listing.geometry.lng, 
            touristLocation.lat, 
            touristLocation.long
          );
          if (distance < 15000) {
            this.foreign = true;
            break;
          }
        }

      // TODO eco-warrior
      this.eco = listing.features.indexOf("Solar Panels") > -1;

      // TODO owner
      if(this.docData.features.length > 8 && (this.docData.furnish_type == "Furnished" || this.docData.furnish_type == "Partly Furnished")){
        this.owner = true;
      }
      // check that all pages weren't exhausted, and that we're in prod or we want to test characteristics in development
      if (pageCounter >= 3 && (process.env['NX_ENVIRONMENT'] == 'production' || this.getCharacteristics)) {
        await this.checkParty();
        await this.checkgym();
        await this.checkFood();
        await this.checkUniversity();
        await this.checkFamily();
      }

      console.log("Saved a grand total of: " + savings);
      // TODO add characteristics to listing
    }
    updates['pointsOfInterestIds'] = this.poiIDs;
    updates['characteristics'] = {
      garden: this.garden,
      farm: this.farm,
      party: this.party,
      mansion: this.mansion,
      foreign: this.foreign,
      lovinIt: this.food,
      family: this.kids,
      student: this.students,
      accessible: this.accessible,
      ecoWarrior: this.eco,
      gym: this.gym,
      owner: this.owner,
      leftUmbrella: this.umbrella,
      openConcept: false,
    };
    await admin
      .firestore()
      .collection('listings')
      .doc(event.listingId)
      .set({
        ...updates
      }, {merge: true});
    this.addMissingPlaces();
    return {status: true, message: "Points of interest added"};
  }

  async filterUnwantedPlaces(toFilter: Partial<PlaceData>[]) {
    // const before = this.places.length;
    toFilter.forEach((place) => {
      // if no place id, or if the place id is already in the list, or if the place doesn't have a wanted type
      if(!place.place_id || this.poiIDs.indexOf(place?.place_id) > -1 || !place.types?.some((type) => this.wantedTypes.includes(type))){
        return;
      }
      place.types?.forEach((type) => {
        const index = this.types.indexOf(type);
        if (index > -1) {
          // TODO Lern tu cownt restaronts
          this.flags[index] = true;
        }
      });
      // TODO simplify
      this.poiIDs.push(place.place_id);
      this.places.push({
        place_id: place.place_id,
        name: place.name,
        geometry: place.geometry,
        types: place.types,
        icon: place.icon,
      });
    });
  }

  async recalculateCharacteristicsOnly() {
    if (!this.docData?.listing_id) {
      return;
    }
    this.garden = this.docData.features.indexOf("Garden") > -1;

    // TODO Mansion
    if(this.docData.floor_size >= 2500 && this.docData.bed>= 4){
      this.mansion = true;
    }
    
    // TODO accessible
    if(this.docData.features.indexOf("Accessible") > -1){
      this.accessible = true;
    }

  // TODO Foreign
    for (const touristLocation of this.touristDestinations) {
      const distance = this.calculateDistanceInMeters(
        this.docData.geometry.lat, 
        this.docData.geometry.lng, 
        touristLocation.lat, 
        touristLocation.long
      );
      if (distance < 15000) {
        this.foreign = true;
        break;
      }
    }

    // TODO eco-warrior
    this.eco = this.docData.features.indexOf("Solar Panels") > -1;

    // TODO owner
    if(this.docData.features.length > 8 && (this.docData.furnish_type == "Furnished" || this.docData.furnish_type == "Partly Furnished")){
      this.owner = true;
    }
    // check that all pages weren't exhausted, and that we're in prod or we want to test characteristics in de
    await this.checkParty();
    await this.checkgym();
    await this.checkFood();
    await this.checkUniversity();
    await this.checkFamily();
    await admin
      .firestore()
      .collection('listings')
      .doc(this.docData.listing_id)
      .set({
        characteristics: {
          garden: this.garden,
          farm: this.farm,
          party: this.party,
          mansion: this.mansion,
          foreign: this.foreign,
          lovinIt: this.food,
          family: this.kids,
          student: this.students,
          accessible: this.accessible,
          ecoWarrior: this.eco,
          gym: this.gym,
          owner: this.owner,
          leftUmbrella: this.umbrella,
          openConcept: false,
        }
      }, {merge: true});
  }
  async addMissingPlaces() {
    if (this.poiIDs.length == 0) {
      return;
    }
    const storedIds: string[] = [];
    for (let startIndex = 0; startIndex < this.poiIDs.length; startIndex += 30) {

      const queryRes = (await admin
        .firestore()
        .collection('pointsOfInterest')
        .where('id', 'in', this.poiIDs.slice(startIndex, Math.min(startIndex+ 29, this.poiIDs.length)))
        .get());

      queryRes.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const place = doc.data() as StoredPlaces;
        storedIds.push(place.id);
      })
    }

    this.places.forEach((place) => {
      if (storedIds.indexOf(place.place_id ?? "") > -1) {
        return;
      }
      this.addPlace(place);
    })
  }

  async addPlace(place: Partial<PlaceData>) {
    if (!place.place_id) {
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
    if (!this.docData || !process.env['NX_GOOGLE_MAPS_KEY'] || !this.geometry) {
      return false;
    }
    if (this.recalculating) {
      let counter = 0;
      for (const place of this.storedPlaces) {
        if (place.types?.includes(type) && this.calculateDistanceInMeters(this.geometry.lat, this.geometry.lng, place.geometry.lat, place.geometry.lng) <= radius) {
          ++counter;
        }
        if (counter >= size) {
          return true;
        }
      }
      return false;
    }
    const request: PlacesNearbyRequest = {
      params:{
        location :{
          lat: this.geometry.lat, 
          lng: this.geometry.lng
        },
        radius: radius,
        key: process.env['NX_GOOGLE_MAPS_KEY'],
        type: type
      }
    };
    const response = await this.mapsClient.placesNearby(request);
    this.filterUnwantedPlaces(response.data.results);
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
      this.party = true;
      return;
    }
    this.flags[this.types.indexOf('bar')] = await this.checkPlaces('bar', 1000);
    if (this.flags[this.types.indexOf('bar')]) {
      this.party = true;
      return;
    }
    
    // check night club nearby
    if (this.flags[this.types.indexOf('night_club')]) {
      this.party = true;
      return;
    }
    this.flags[this.types.indexOf('night_club')] = await this.checkPlaces('night_club', 1000);
    if (this.flags[this.types.indexOf('night_club')]) {
      this.party = true;
      return;
    }
    // check casino nearby
    if (this.flags[this.types.indexOf('casino')]) {
      this.party = true;
      return;
    }
    this.flags[this.types.indexOf('casino')] = await this.checkPlaces('casino', 2000);
    if (this.flags[this.types.indexOf('casino')]) {
      this.party = true;
      return;
    }
  }

  async checkgym() {
    if (this.flags[this.types.indexOf('gym')]) {
      return;
    }
    this.gym = await this.checkPlaces('gym', 3000);
    
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
    // TODO, maybe replace with uber eats? Everywhere has delivery
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
    this.food = true;
  }

  async checkUniversity() {
    const listing = this.docData;
    if (!listing) {
      return;
    }
    if(listing.price > 6000 || listing.features.indexOf("Wifi") == -1) {
      this.students = false;
      return
    }

    if (this.flags[this.types.indexOf('university')]) {
      this.students = true;
      return;
    }

    this.students = await this.checkPlaces('university', 5000);
  }

  async checkFamily() {
    if (!this.flags[this.types.indexOf('school')]) {
      this.flags[this.types.indexOf('school')] = await this.checkPlaces('school', 10000);
    }
    if (!this.flags[this.types.indexOf('school')] && !this.flags[this.types.indexOf('primary_school')]) {
      this.flags[this.types.indexOf('primary_school')] = await this.checkPlaces('primary_school', 10000);
    }
    if (!this.flags[this.types.indexOf('school')] && !this.flags[this.types.indexOf('primary_school')]) {
      return;
    }

    if (!this.flags[this.types.indexOf('movie_theater')]) {
      this.flags[this.types.indexOf('movie_theater')] = await this.checkPlaces('movie_theater', 10000);
    }
    if (this.flags[this.types.indexOf('movie_theater')]) {
      this.kids = true;
      return;
    }

    if (!this.flags[this.types.indexOf('park')]) {
      this.flags[this.types.indexOf('park')] = await this.checkPlaces('park', 1000);
    }
    if (this.flags[this.types.indexOf('park')]) {
      this.kids = true;
      return;
    }
    
    if (!this.flags[this.types.indexOf('zoo')]) {
      this.flags[this.types.indexOf('zoo')] = await this.checkPlaces('zoo', 10000);
    }
    if (this.flags[this.types.indexOf('zoo')]) {
      this.kids = true;
      return;
    }
    
    if (!this.flags[this.types.indexOf('bowling_alley')]) {
      this.flags[this.types.indexOf('bowling_alley')] = await this.checkPlaces('bowling_alley', 10000);
    }
    if (this.flags[this.types.indexOf('bowling_alley')]) {
      this.kids = true;
      return;
    }
    
    if (!this.flags[this.types.indexOf('amusement_park')]) {
      this.flags[this.types.indexOf('amusement_park')] = await this.checkPlaces('amusement_park', 10000);
    }
    if (this.flags[this.types.indexOf('amusement_park')]) {
      this.kids = true;
      return;
    }
    
    if (!this.flags[this.types.indexOf('aquarium')]) {
      this.flags[this.types.indexOf('aquarium')] = await this.checkPlaces('aquarium', 10000);
    }
    if (this.flags[this.types.indexOf('aquarium')]) {
      this.kids = true;
      return;
    }
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
  
  toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }
}