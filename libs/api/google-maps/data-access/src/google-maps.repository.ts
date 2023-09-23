
import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { Listing, StatusChangedEvent } from '@properproperty/api/listings/util';
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
    const pointIDs = docData.pointsOfInterestIds ?? [];
    if (pointIDs.length == 0) {
      return { response: []};
    }
    const snapshot = await admin
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
  umbrella = false;

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
  async geocodeAddress(address ?: string){
    const keeeeee = process.env['NX_GOOGLE_MAPS_KEY']
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
    const poiIDs : string[] = [];
    const places: Partial<PlaceData>[] = [];
    let pageCounter = 0; // fail-safe
    while (pageFlag && pageCounter < 3) {
      ++pageCounter;
      pageFlag = false;
      const request: PlacesNearbyRequest = {
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
      } catch (e) {
        console.log("NearbyPlaces Failed: ");
        console.log(e);
        return {status: false, message: e};
      }
      if (!response) {
        return {status: false, message: "Google sux"};
      }
      token = response.data.next_page_token;
      if (token) {
        console.log(pageCounter, ": But wait (10-ish seconds)! There's more!");
        pageFlag = true;
        await sleep(10000);
        console.log("Waiting finished");
      }
      
      response.data.results.forEach((place) => {
        if(!place.place_id || !place.types?.some((type) => this.wantedTypes.includes(type))){
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
    // TODO set "middle of nowhere" if no POIS added after loop
    let savings = -0.032 * 3;
    for ( let x = 0; x < this.types.length && process.env['NX_ENVIRONMENT']; ++x) {
      const BOOl = this.flags[x];
      if (BOOl) {
        savings += 0.032;
      }
    }
    if (process.env['NX_RECOMMENDATION']) {
      // TODO Garden
      // this.garden = this.checkfeature("Garden");

      // TODO Mansion
      // if(parseInt(this.floor_size) >= 2500 && parseInt(this.bedrooms)>= 4)
      // {
      //   this.mansion = true;
      // }
      
      // TODO accessible
      // for(const feat of this.features)
      // {
      //   if(feat == "Accessible")
      //   {
      //     this.accessible = true;
      //   }
      // }

      // TODO Foreign
      // if(await this.checkNearTourist())
      // {
      //   this.foreign = true;
      // }

      // TODO eco-warrior
      // this.eco = this.checkfeature("Solar Panels");

      // TODO owner
      // if(this.features.length > 8 && (this.furnish_type== "Furnished"|| this.furnish_type== "Partly Furnished"))
      // {
      //   console.log("Is an owner and ", this.furnish_type);
      //   this.owner = true;
      // }

      //Middle of nowhere, farm
      // if(await this.checkNolocationfeatures(10000))
      // {
      //   this.farm = true;
      // }

      if (pageCounter >= 3 && this.getCharacteristics) {
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
      // TODO add characteristics to listing
    }
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
    if (ids.length == 0) {
      return;
    }
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
  }

  async checkUniversity() {
    // TODO: Check price
    // if(parseInt(this.price) < 6000)
    //   {
    //     if(this.checkfeature("Wifi"))
    //     {
    //       this.students = true;
    //     }
    //   }
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