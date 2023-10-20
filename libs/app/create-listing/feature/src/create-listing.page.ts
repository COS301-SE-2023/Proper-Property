// eslint-disable-next-line
/// <reference types="@types/google.maps" />

import { Component, ViewChild, ElementRef, HostListener, isDevMode } from '@angular/core';
import { UserProfileService } from '@properproperty/app/profile/data-access';
import { Listing, StatusEnum } from '@properproperty/api/listings/util';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenAIService } from '@properproperty/app/open-ai/data-access';
import { Select, Store } from '@ngxs/store';
import { AuthState } from '@properproperty/app/auth/data-access';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { GmapsService } from '@properproperty/app/google-maps/data-access';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators'

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],

})
export class CreateListingPage {


  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;

  onInputPrice(ev: { target: any; }) {
    console.log(ev.target.value);
    let value = ev.target!.value;
    value = value.replace(/^0+/,'');
    if (!value) { return; }
    if (!(/^\d+$/.test(value)) || value < 0) {
      value = 0;
    }
    if (value.length > 9) {
      value = 999999999;
    }

    ev.target.value = this.price = value;
  }

  onInputBathroom(ev: { target: any; }) {
    console.log(ev.target.value);
    let value = ev.target!.value;
    value = value.replace(/^0+/,'');

    if (!value) { return; }
    if (!(/^\d+$/.test(value)) || value < 0) {
      value = 0;
    }
    if (value.length > 2) {
      value = 99;
    }

    ev.target.value = this.bathrooms = value;
  }

  onInputBedroom(ev: { target: any; }) {
    console.log(ev.target.value);
    let value = ev.target!.value;
    value = value.replace(/^0+/,'');

    if (!value) { return; }
    if (!(/^\d+$/.test(value)) || value < 0) {
      value = 0;
    }
    if (value.length > 2) {
      value = 99;
    }

    ev.target.value = this.bedrooms = value;
  }

  onInputFloor(ev: { target: any; }) {
    console.log(ev.target.value);
    let value = ev.target!.value;
    value = value.replace(/^0+/,'');

    if (!value) { return; }
    if (!(/^\d+$/.test(value)) || value < 0) {
      value = 0;
    }
    if (value.length > 4) {
      value = 9999;
    }

    ev.target.value = this.floor_size = value;
  }

  onInputErf(ev: { target: any; }) {
    console.log(ev.target.value);
    let value = ev.target!.value;
    value = value.replace(/^0+/,'');

    if (!value) { return; }
    if (!(/^\d+$/.test(value)) || value < 0) {
      value = 0;
    }
    if (value.length > 5) {
      value = 99999;
    }

    ev.target.value = this.erf_size = value;
  }

  onInputParking(ev: { target: any; }) {
    console.log(ev.target.value);
    let value = ev.target!.value;
    value = value.replace(/^0+/,'');

    if (!value) { return; }
    if (!(/^\d+$/.test(value)) || value < 0) {
      value = 0;
    }
    if (value.length > 2) {
      value = 99;
    }

    ev.target.value = this.parking = value;
  }

  myControl = new FormControl();
  options: string[] = ['Angular', 'React', 'Vue', 'Ionic', 'TypeScript'];
  municipalities:string[] = [
    'Umzinyathi District municipality(DC24)',
  'eThekwini Metropolitan Municipality(ETH)',
  'The Msunduzi Local Municipality(KZN225)',
  'Ugu District municipality(DC21)',
  'Amajuba District municipality(DC25)',
  'UMgungundlovu District municipality(DC22)',
  'Newcastle Local Municipality(KZN252)', 
  'Zululand District municipality(DC26)', 
  'King Cetshwayo DM(DC28)',
   'Harry Gwala District municipality(DC43)', 'Uthukela District municipality(DC23)', 'uMhlathuze Local Municipality(KZN282)', 'Umkhanyakude District municipality(DC27)', 'iLembe District municipality(DC29)', 'Theewaterskloof Local Municipality(WC031)', 'Cederberg Local Municipality(WC012)', 'Letsemeng Local Municipality(FS161)', 'Setsoto Local Municipality(FS191)', 'Kopanong Local Municipality(FS162)', 'Mohokare Local Municipality(FS163)', 'Masilonyana Local Municipality(FS181)', 'Dihlabeng Local Municipality(FS192)', 'Matjhabeng Local Municipality(FS184)', 'Phumelela Local Municipality(FS195)', 'Tswelopele Local Municipality(FS183)', 'Nketoana Local Municipality(FS193)', 'Maluti a Phofung Local Municipality(FS194)', 'Moqhaka Local Municipality(FS201)', 'Nala Local Municipality(FS185)', 'Mangaung(MAN)', 'Mantsopa Local Municipality(FS196)', 'Ngwathe Local Municipality(FS203)', 'Metsimaholo Local Municipality(FS204)', 'Mafube Local Municipality(FS205)', 'Matzikama Local Municipality(WC011)', 'Drakenstein Local Municipality(WC023)', 'Hessequa Local Municipality(WC042)', 'Bergrivier Local Municipality(WC013)', 'Cape Agulhas Local Municipality(WC033)', 'Langeberg Municipality(WC026)', 'Mossel Bay Local Municipality(WC043)', 'Saldanha Bay Local Municipality(WC014)', 'Oudtshoorn Local Municipality(WC045)', 'Overstrand Local Municipality(WC032)', 'Beaufort West Local Municipality(WC053)', 'Swartland Local Municipality(WC015)', 'Knysna Local Municipality(WC048)', 'Swellendam Local Municipality(WC034)', 'City of Cape Town Metropolitan Municipality(CPT)', 'Witzenberg Local Municipality(WC022)', 'George Local Municipality(WC044)', 'Stellenbosch Local Municipality(WC024)', 'Bitou Local Municipality(WC047)', 'Breede Valley Local Municipality(WC025)', 'Laingsburg Local Municipality(WC051)', 'Kannaland Local Municipality(WC041)', 'Prince Albert Local Municipality(WC052)', 'Emfuleni Local Municipality(GT421)', 'City of Tshwane Metropolitan Municipality(TSH)', 'Rand West City(GT485)', 'Mogale City Local Municipality(GT481)', 'Midvaal Local Municipality(GT422)', 'Merafong City Local Municipality(GT484)', 'Lesedi Local Municipality(GT423)', 'City of Ekurhuleni(EKU)', 'City of Johannesburg Metropolitan Municipality(JHB)', 'Vhembe District municipality(DC34)', 'Mopani District municipality(DC33)', 'Modimolle/Mookgophong(LIM368)', 'Polokwane Local Municipality(LIM354)', 'Capricorn District municipality(DC35)', 'Greater Sekhukhune District Municipality(DC47)', 'Thabazimbi Local Municipality(LIM361)', 'Mogalakwena Local Municipality(LIM367)', 'Lephalale Local Municipality(LIM362)', 'Bela-Bela Local Municipality(LIM366)', 'Richtersveld Local Municipality(NC061)', 'Kamiesberg Local Municipality(NC064)', 'Nama Khoi Local Municipality(NC062)', 'Khai-Ma Local Municipality(NC067)', 'Hantam Local Municipality(NC065)', 'Karoo Hoogland Local Municipality(NC066)', 'Emthanjeni Local Municipality(NC073)', 'Ubuntu Local Municipality(NC071)', 'Thembelihle Local Municipality(NC076)', 'Umsobomvu Local Municipality(NC072)', 'Kareeberg Local Municipality(NC074)', 'Dawid Kruiper(NC087)', 'Siyancuma Local Municipality(NC078)', 'Siyathemba Local Municipality(NC077)', 'Renosterberg Local Municipality(NC075)', 'Phokwane Local Municipality(NC094)', 'Dikgatlong Local Municipality(NC092)', 'Kgatelopele Local Municipality(NC086)', '!Kai! Garib Local Municipality(NC082)', 'Ga-Segonyana Local Municipality(NC452)', 'Joe Morolong Local Municipality(NC451)', 'Magareng Local Municipality(NC093)', '!Kheis Local Municipality(NC084)', 'Gamagara Local Municipality(NC453)', 'Sol Plaatjie Local Municipality(NC091)', 'Blue Crane Route Local Municipality(EC102)', 'Makana Local Municipality(EC104)', 'Dr Beyers Naude(EC101)', 'Sunday`s River Valley Local Municipality(EC106)', 'Amatole District municipality(DC12)', 'Kouga Local Municipality(EC108)', 'Ndlambe Local Municipality(EC105)', 'Kou-Kamma Local Municipality(EC109)', 'Chris Hani District municipality(DC13)', 'Buffalo City Local Municipality(BUF)', 'Joe Gqabi District municipality(DC14)', 'Nelson Mandela Metropolitan Municipality(NMA)', 'O.R.Tambo District municipality(DC15)', 'Alfred Nzo District municipality(DC44)', 'Albert Luthuli Local Municipality(MP301)', 'Steve Tshwete Local Municipality(MP313)', 'Mkhondo Local Municipality(MP303)', 'Msukaligwa Local Municipality(MP302)', 'Lekwa Local Municipality(MP305)', 'Emakhazeni Local Municipality(MP314)', 'Pixley Ka Seme Local Municipality(MP304)', 'Dipaleseng Local Municipality(MP306)', 'Emalahleni Local Municipality(MP312)',
  'Victor Khanye Local Municipality(MP311)',
  'Govan Mbeki Local Municipality(MP307)',
  'Dr JS Moroka Local Municipality(MP316)',
  'Thembisile Local Municipality(MP315)',
  'Bushbuckridge Local Municipality(MP325)',
  'Thaba Chweu Local Municipality(MP321)',
  'Mbombela/Umjindi(MP326)',
  'Nkomazi Local Municipality(MP324)',
  'Maquassi Hills Local Municipality(NW404)',
  'Local Municipality of Madibeng(NW372)',
  'Moretele Local Municipality(NW371)',
  'Rustenburg Local Municipality(NW373)',
  'JB Marks Local Municipality(NW405)',
  'Kgetlengrivier Local Municipality(NW374)',
  'Ngaka Modiri Molema District Municipality(DC38)',
  'Moses Kotane Local Municipality(NW375)',
  'Dr. Ruth S Mompati District Municipality(DC39)',
  'Matlosana Local Municipality(NW403)'];

  filteredMunicipalities: string[] = [];

  handleMunicipalityInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value.toLowerCase();

    if (inputValue.length <= 0) {
      this.filteredMunicipalities = [];
      return;
    }

    this.filteredMunicipalities = this.municipalities.filter((municipality) =>
    municipality.toLowerCase().includes(inputValue)
    );
  }

  selectMunicipality(municipality: string): void {
    this.district = municipality;
    this.filteredMunicipalities = [];
  }

  filteredOptions: Observable<string[]>;

  items: any[] = [];

  @ViewChild('loader') scrollToElement: ElementRef | undefined;
  @ViewChild('address', { static: false }) addressInput!: ElementRef<HTMLInputElement>;

  @Select(AuthState.user) user$!: Observable<User | null>;
  // autocomplete: any;;
  maps: any;
  predictions: any[] = [];
  isMobile = false;
  currentUser: User | null = null;
  description = "";
  heading = "";
  ownerViewing = false;
  listingEditee: Listing | null = null;

  photos: string[] = [];
  address = "";
  district = "";
  price = 0;
  bathrooms = 0;
  bedrooms = 0;
  parking = 0;
  floor_size = 0;
  erf_size = 0;
  pos_type = "";
  env_type = "";
  prop_type = "";
  furnish_type = "";
  orientation = "";
  loadingMessage = "";
  count = 0;
  geometry = {
    lat: 0,
    lng: 0
  };
  pointsOfInterestIds: string[] = [];
  listingType = "Sell";
  listingAreaType = "Rural";


  constructor(
    private readonly router: Router,
    private readonly userService: UserProfileService,
    private readonly listingService: ListingsService,
    private readonly openAIService: OpenAIService,
    private readonly gmapsService: GmapsService,
    private readonly store: Store,
    private route: ActivatedRoute,
  ) {
    this.gmapsService.loadGoogleMaps().then((maps) => {
      this.maps = maps;
    });
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );


    this.isMobile = window.innerWidth <= 576;

    this.address = "";
    this.floor_size = this.price = this.erf_size = this.bathrooms = this.bedrooms = this.parking = 0;
    this.predictions = [];
    // this.defaultBounds = new google.maps.LatLngBounds();
    if (isDevMode()) {
      // this.address = "3 Curzon Place, la Lucia, Umhlanga";
      // this.price = 1000000;
      // this.floor_size = 100;
      // this.erf_size = 100;
      // this.bathrooms = 2;
      // this.bedrooms = 3;
      // this.parking = 1;
      // this.pos_type = "Leasehold";
      // this.env_type = "Gated Community";
      // this.prop_type = "House";
      // this.furnish_type = "Furnished";
      // this.orientation = "North";
      // this.description = "This is a description";
      // this.heading = "This is a heading";
      // this.district = 'eThekwini'
    }
    this.user$.subscribe((user: User | null) => {
      this.currentUser = user;
    });

    this.route.params.subscribe((params) => {
      const editListingId = params['listingId'] ?? 'XX'
      if (editListingId != 'XX') {
        this.listingService.getListing(editListingId).then((listing) => {
          this.listingEditee = listing;
          if (listing != undefined) {
            this.ownerViewing = true;
            this.address = listing.address;
            this.price = listing.price;
            this.floor_size = listing.floor_size;
            this.erf_size = listing.property_size;
            this.bathrooms = listing.bath;
            this.bedrooms = listing.bed;
            this.parking = listing.parking;
            this.pos_type = listing.pos_type;
            this.env_type = listing.env_type;
            this.prop_type = listing.prop_type;
            this.furnish_type = listing.furnish_type;
            this.orientation = listing.orientation;
            this.description = listing.desc;
            this.heading = listing.heading;
            this.features = listing.features;
            this.photos = listing.photos;
            this.listingType = listing.let_sell;
            this.geometry = listing.geometry;
            this.pointsOfInterestIds = listing.pointsOfInterestIds;
            this.district = listing.district;
            this.listingAreaTypeSlider = listing.listingAreaType == "Rural" ? true : false;
            this.selectedValue = listing.let_sell == "Sell" ? true : false;
          }
        });
      }
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (!event) console.log(event);
    this.isMobile = window.innerWidth <= 576;
  }

  features: string[] = [];

  loadingAddress = false;
  timeout: NodeJS.Timeout | undefined;
  async handleInputChange(event: Event): Promise<void> {
    this.loadingAddress = true;
    this.maps = this.maps ?? await this.gmapsService.loadGoogleMaps();
    // Ur going 100 in a 60 zone, buddy
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      const input = event.target as HTMLInputElement;

      if (input.value.length <= 0) {
        this.predictions = [];
      }
      else {
        this.gmapsService.handleInput(input, new this.maps.LatLngBounds()).then(() => {
          this.predictions = this.gmapsService.predictions;
          this.loadingAddress = false;
        });
      }
    }, 1500);

  }


  // replaceInputText(event: MouseEvent | undefined,prediction: string) {
  //   // this.address = prediction;
  //   //set the text in HTML element with id=hello to predictions
  //   if (event) {
  //     event.preventDefault(); // Prevent the default behavior of the <a> tag
  //   }

  //   const addressInput = document.getElementById("address") as HTMLInputElement;
  //   if (addressInput) {
  //     addressInput.value = prediction;
  //   }
  //   this.predictions = [];
  // }

  replaceInputText(event: MouseEvent | undefined, prediction: string) {
    if (event) {
      event.preventDefault(); // Prevent the default behavior of the <a> tag
    }

    const addressInput = document.getElementById("address") as HTMLInputElement;
    if (addressInput) {
      addressInput.value = prediction;
    }
    this.predictions = [];

    // Update the 'address' property of the component class
    this.address = prediction;

  }

  // handleAddressChange(address: string): void {
  //    this.address = address;
  // }

  handleFileInput(event: Event) {
    if (!event.currentTarget) {
      return;
    }
    const files: FileList | null = (event.currentTarget as HTMLInputElement).files;
    if (files) {
      for (let index = 0; index < files.length; index++) {
        if (files.item(index))
          this.photos.push(URL.createObjectURL(files.item(index) as Blob));
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.target) {
      return;
    }
    const files = (event.target as HTMLInputElement).files;

    if (files) {
      for (let index = 0; index < files.length; index++) {
        if (files.item(index))
          this.photos.push(URL.createObjectURL(files.item(index) as Blob));
      }
    }

  }

  removeImage(index: number) {
    this.photos.splice(index, 1);
  }

  selectPhotos() {
    const fileInput = document.querySelector('input[type = "file"]');
    if (fileInput) {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: false,
        cancelable: true
      });
      fileInput.dispatchEvent(event);
    }
  }

  formatPrice() {
    this.address = (document.getElementById("address") as HTMLInputElement).value;
    // console.log("eyy cousinn...",this.address);
    // Remove existing commas from the price
    // this.price = this.price.replace(/,/g, '');

    // Format the price with commas
    // this.price = this.price.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  numericOnly(event: KeyboardEvent): boolean {
    const pattern = /^[0-9]+$/;
    const input = event.target as HTMLInputElement;
    const result = pattern.test(input.value + event.key);
    
    if (!result) {
      event.preventDefault();
    }
  
    return result;
  }
  
  propSizeValidation(event: KeyboardEvent): boolean {
    // Update the pattern to match numbers between 1 and 99,000
    const pattern = /^([1-9][0-9]{0,3}|100000)$/;
    const input = event.target as HTMLInputElement;
    const result = pattern.test(input.value + event.key);
    
    if (!result) {
      event.preventDefault();
    }
  
    return result;
  }
  
  descriptionLoading = false;
  async generateDesc(){

    if (!this.address||!this.price||!this.bedrooms||!this.bathrooms||!this.floor_size||!this.erf_size||!this.parking) {
      alert("Missing required fields");
      return ;
    }

    this.descriptionLoading = true;
    let feats = "";
    for (let i = 0; i < this.features.length; i++) {
      feats += this.features[i] + ", ";
    }

    if (this.address && this.price && this.pos_type && this.env_type && this.prop_type
      && this.furnish_type && this.orientation && this.floor_size && this.erf_size
      && this.bathrooms && this.bedrooms && this.parking) {
      const info = "Address: " + this.address + "\n "      + "Price: " + this.price + "\n "      + "Possession type: " + this.pos_type + "\n "      + "Environment type: " + this.env_type + "\n "      + "Property type: " + this.prop_type + "\n "      + "Furnishing state: " + this.furnish_type + "\n "      + "Orientation of the house: " + this.orientation + "\n "      + "Floor size: " + this.floor_size + "\n "      + "Property size: " + this.erf_size + "\n "      + "Number of bathrooms: " + this.bathrooms + "\n "      + "Number of bedrooms" + this.bedrooms + "\n "      + "Number of parking spots: " + this.parking + "\n";
      + "Features: " + feats + "\n";

      const response = await this.openAIService.getHeadingAndDesc("Give me a description of a property with the following information: \n" + info
        + "Be as descriptive as possible such that I would want to buy the house after reading the description")

      this.description = response.description;
      this.heading = response.head;
    }

    this.descriptionLoading = false;
  }
  addFeature() {
    const feat_in = document.getElementById('feat-in') as HTMLInputElement;

    if (feat_in) {
      const feat = feat_in.value;
      if (feat != "") {
        this.features.push(feat);
        feat_in.value = "";
      }
    }
  }
  //removeFeature
  removeFeature(index: number) {
    this.features.splice(index, 1);
  }
  selectedValue = true;
  listingAreaTypeSlider = true;
  ////////////////////////////// Recommendation System Add-Ons ////////////////////////////////////////

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

    { lat: -34.176050, long: 18.342900 },
    { lat: -34.195390, long: 18.448440 },
    { lat: -33.905883288483416, long: 18.419559881341613 },
    { lat: -34.027445620027166, long: 18.423969494340202 },
    { lat: -33.392068620368626, long: 22.214438260829674 },
    { lat: -33.96514937559787, long: 23.647563426763526 },
    { lat: -33.63071315123244, long: 22.16256336631636 },
    { lat: -34.03129778606299, long: 23.268054710171135 },
    { lat: -34.059403776473296, long: 24.925173425242086 },
    { lat: -28.739026512440127, long: 24.75851569159852 },
    { lat: -28.591087302842954, long: 20.340018582987643 },
    { lat: -26.237620540599668, long: 28.008435662716852 },
    { lat: -26.235801689082212, long: 28.013123779328716 },
    { lat: -26.1559515206671, long: 28.08378026658916 },
    { lat: -25.749179107587615, long: 27.89070119780269 },
    { lat: -26.10722590098277, long: 28.054846836406742 },
    { lat: -26.024251206632584, long: 28.01180037855904 },
    { lat: -25.77601429876691, long: 28.1757716231563 },
    { lat: -25.966873618607902, long: 27.6625737674743 },
    { lat: -26.016628111537738, long: 27.7335727936381 },
    { lat: -25.357142891151142, long: 27.100530200731004 },
    { lat: -25.253891585249146, long: 27.219679545822608 },
    { lat: -29.86710808840616, long: 31.045841467231135 },
    { lat: -29.846719768113445, long: 31.036797371292593 },
    { lat: -34.07715084394336, long: 18.891699304113544 },
    { lat: -24.572030884249113, long: 30.79878685209525 },
    { lat: -24.057146033668925, long: 30.86003735206916 },
  ];

  // async setCharacteristics()
  // {
  //   return;
  //   //Garden
  //   this.garden = this.checkfeature("Garden");
  //   // Check for garden image

  //   //party
  //   if(await this.checklocationfeatures("bar", 1000) || await this.checklocationfeatures("night_club", 1000) || await this.checklocationfeatures("casino", 2000))
  //   {
  //     if(await this.checklocationfeaturesCounter("liquor_store", 1000)> 1)
  //     {
  //       this.party = true;
  //     }

  //   }

  //   //Mansion

  //   if(this.floor_size >= 2500 && this.bedrooms >= 4)
  //   {
  //     this.mansion = true;
  //   }

  //   //accessible
  //   for(const feat of this.features)
  //   {
  //     if(feat == "Accessible")
  //     {
  //       this.accessible = true;
  //     }
  //   }

  //   //Foreign
  //   if(await this.checkNearTourist())
  //   {
  //     this.foreign = true;
  //   }


  //   //gym
  //   if(await this.checklocationfeatures("gym", 3000))
  //   {
  //     this.gym = true;
  //   }

  //   //Food
  //   this.food = true;
  //   const Dansw = this.checklocationfeaturesCounter("meal_delivery", 3000);
  //   console.log("Meal Delivery: ", Dansw);
  //   if(await Dansw < 2)
  //   {
  //     this.food = false;
  //   }

  //   const Ransw = this.checklocationfeaturesCounter("restaurant", 3000);
  //   console.log("Restaurants: ", Ransw);
  //   if(await Ransw < 3)
  //   {
  //     this.food = false;
  //   }

  //   const Cansw = this.checklocationfeaturesCounter("cafe", 3000);
  //   console.log("Cafes: ", Cansw);
  //   if(await Cansw < 1)
  //   {
  //     this.food = false;
  //   }

  //   const Tansw = this.checklocationfeaturesCounter("meal_takeaway", 3000);
  //   console.log("Takeawaya: ", Tansw);
  //   if(await Tansw < 6)
  //   {
  //     this.food = false;
  //   }

  //   //Student

  //   if(await this.checklocationfeatures("university", 5000))
  //   {
  //     if(this.price < 6000)
  //     {
  //       if(this.checkfeature("Wifi"))
  //       {
  //         this.students = true;
  //       }
  //     }
  //   }

  //   //owner
  //   if(this.features.length > 8 && (this.furnish_type== "Furnished"|| this.furnish_type== "Partly Furnished"))
  //   {
  //     console.log("Is an owner and ", this.furnish_type);
  //     this.owner = true;
  //   }


  //   //Middle of nowhere, farm

  //   if(await this.checkNolocationfeatures(10000))
  //   {
  //     this.farm = true;
  //   }


  // }

  // checkfeature(a : string)
  // {
  //     for(let x =0; x< this.features.length; x++)
  //     {
  //       if(a == this.features[x])
  //       {
  //         return true;
  //       }
  //     }

  //     return false;
  // }


  // async checklocationfeatures(placeType: string, distanceFrom: number)
  // {
  //   try {
  //     const coordinates = await this.gmapsService.getLatLongFromAddress(this.address);
  //     if (coordinates) {
  //       const results = await this.gmapsService.getNearbyPlaceType(
  //         coordinates.latitude,
  //         coordinates.longitude,
  //         placeType
  //       );

  //       console.log(results);

  //       for (const result of results) {
  //         if(result.types){
  //           for(const type of result.types){
  //             if(type == placeType){
  //               if(result.vicinity)
  //               {
  //                 const latlong = this.gmapsService.getLatLongFromAddress(result.vicinity);

  //                 const distance = await this.gmapsService.calculateDistanceInMeters(coordinates.latitude, coordinates.longitude, (await latlong).latitude, (await latlong).longitude)
  //                 console.log(result.name, distance, "meters away from ", this.address);
  //                 if(distance< distanceFrom)
  //                 {
  //                   return true;
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error retrieving nearby places:', error);
  //   }

  //   return false;
  // }

  // async checklocationfeaturesCounter(placeType: string, distanceFrom: number)
  // {
  //   this.count = 0;
  //   try {
  //     const coordinates = await this.gmapsService.getLatLongFromAddress(this.address);
  //     if (coordinates) {
  //       const results = await this.gmapsService.getNearbyPlaceType(
  //         coordinates.latitude,
  //         coordinates.longitude,
  //         placeType
  //       );

  //       console.log(results);

  //       for (const result of results) {
  //         if(result.types){
  //           for(const type of result.types){
  //             if(type == placeType){
  //               if(result.vicinity)
  //               {
  //                 const latlong = this.gmapsService.getLatLongFromAddress(result.vicinity);

  //                 const distance = await this.gmapsService.calculateDistanceInMeters(coordinates.latitude, coordinates.longitude, (await latlong).latitude, (await latlong).longitude)
  //                 console.log(result.name, distance, "meters away from ", this.address);
  //                 if(distance< distanceFrom)
  //                 {
  //                   this.count++;
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error retrieving nearby places:', error);
  //   }
  //   return this.count;
  // }

  // async checkNearTourist()
  // {

  //   const coordinates = await this.gmapsService.getLatLongFromAddress(this.address);

  //   for(const pin of this.touristDestinations)
  //   {
  //     const distance = await this.gmapsService.calculateDistanceInMeters(coordinates.latitude, coordinates.longitude, pin.lat, pin.long)

  //     if(distance< 15000)
  //     {
  //       console.log("tourist coordinates:", pin.lat, pin.long);
  //       return true;
  //     }
  //   }

  //   return false;
  // }

  //TODO redo in google -maps.repository using the new stored POIs
  // async checkNolocationfeatures(distanceFrom: number)
  // {
  //   return false;
  //   // try {
  //   //   const coordinates = await this.gmapsService.getLatLongFromAddress(this.address);
  //   //   if (coordinates) {
  //   //     const results = await this.gmapsService.getNearbyPlaces(
  //   //       coordinates.latitude,
  //   //       coordinates.longitude
  //   //     );

  //   //     console.log(results);

  //   //     for (const result of results) {
  //   //       if(result.types){
  //   //         for(const type of result.types){
  //   //           if(type != "cemetery" && type != "campground"){
  //   //             if(result.vicinity)
  //   //             {
  //   //               const latlong = this.gmapsService.getLatLongFromAddress(result.vicinity);

  //   //               const distance = await this.gmapsService.calculateDistanceInMeters(coordinates.latitude, coordinates.longitude, (await latlong).latitude, (await latlong).longitude)
  //   //               console.log(result.name, distance, "meters away from ", this.address);
  //   //               if(distance< distanceFrom)
  //   //               {
  //   //                 return false;
  //   //               }
  //   //             }
  //   //           }
  //   //         }
  //   //       }
  //   //     }
  //   //   }
  //   // } catch (error) {
  //   //   console.error('Error retrieving nearby places:', error);
  //   // }

  //   // return true;
  // }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  changeListingType() {
    if (this.selectedValue) {
      this.listingType = "Rent";
    }
    else {
      this.listingType = "Sell";
    }
  }

  changeListingAreaType() {
    if (this.listingAreaTypeSlider) {
      this.listingAreaType = "Urban";
    }
    else {
      this.listingAreaType = "Rural";
    }
  }

  async addListing(creationType: string) {
    this.loadingMessage = creationType === "create" ? "Sent for Approval" : "Saving Listing Draft";
    const property = document.querySelector('.add-property') as HTMLElement;
    const loader = document.querySelector('#loader') as HTMLElement;
    property.style.opacity = "0";
    loader.style.opacity = "1";
    if (this.scrollToElement && this.scrollToElement.nativeElement) {
      this.scrollToElement.nativeElement.scrollIntoView({ block: 'center' });
    }
    this.address = (document.getElementById("address") as HTMLInputElement).value;
    //  await this.setCharacteristics();

    const score = await this.calculateQualityScore(
      this.photos,
      this.address,
      this.price,
      this.bedrooms,
      this.bathrooms,
      this.parking,
      this.floor_size,
      this.erf_size,
      this.pos_type,
      this.env_type,
      this.prop_type,
      this.furnish_type,
      this.orientation
    );

    if (this.currentUser != null) {
      const list: Listing = {
        user_id: this.currentUser.uid,
        address: this.address,
        district: this.district,
        price: this.price,
        pos_type: this.pos_type,
        env_type: this.env_type,
        prop_type: this.prop_type,
        furnish_type: this.furnish_type,
        orientation: this.orientation,
        floor_size: this.floor_size,
        property_size: this.erf_size,
        bath: this.bathrooms,
        bed: this.bedrooms,
        parking: this.parking,
        features: this.features,
        photos: this.photos,
        desc: this.description,
        heading: this.heading,
        let_sell: this.listingType,
        listingAreaType: this.listingAreaType,
        statusChanges: [],
        quality_rating: score,
        status: creationType == "save" ? StatusEnum.SAVED : StatusEnum.PENDING_APPROVAL,
        characteristics: {
          garden: this.garden,
          party: this.party,
          mansion: this.mansion,
          accessible: this.accessible,
          foreign: this.foreign,
          openConcept: false,
          ecoWarrior: false,
          family: false,
          student: this.students,
          lovinIt: this.food,
          farm: this.farm,
          gym: this.gym,
          owner: this.owner,
          leftUmbrella: false
        },
        listingDate: "" + new Date(),
        geometry: {
          lat: 0,
          lng: 0
        },
        pointsOfInterestIds: [],
        areaScore: {
          crimeScore: 0,
          schoolScore: 0,
          waterScore: 0,
          sanitationScore: 0
        }
      }

      if (creationType == "create") {
        await this.listingService.createListing(list);
      }
      else if (creationType == "save") {
        if (this.listingEditee)
          list.listing_id = this.listingEditee.listing_id;

        await this.listingService.saveListing(list);
      }
      loader.style.opacity = "0";
      property.style.opacity = "1";
      this.router.navigate(['/home']);
    }
    else {
      console.log("Error in create-lisitng.page.ts - there is no current user");
    }
  }

  async editListing() {
    this.loadingMessage = "Edits Submitted for Approval";
    const property = document.querySelector('.add-property') as HTMLElement;
    const loader = document.querySelector('#loader') as HTMLElement;
    property.style.opacity = "0";
    loader.style.opacity = "1";
    if (this.scrollToElement && this.scrollToElement.nativeElement) {
      this.scrollToElement.nativeElement.scrollIntoView({ block: 'center' });
    }
    if (this.currentUser != null && this.listingEditee != null && this.listingEditee.user_id == this.currentUser.uid) {

      // await this.setCharacteristics();

      const list: Listing = {
        listing_id: this.listingEditee.listing_id,
        statusChanges: this.listingEditee.statusChanges,
        quality_rating: this.listingEditee.quality_rating,
        user_id: this.currentUser.uid,
        address: this.address,
        district: this.district,
        price: this.price,
        pos_type: this.pos_type,
        env_type: this.env_type,
        prop_type: this.prop_type,
        furnish_type: this.furnish_type,
        orientation: this.orientation,
        floor_size: this.floor_size,
        property_size: this.erf_size,
        bath: this.bathrooms,
        bed: this.bedrooms,
        parking: this.parking,
        features: this.features,
        photos: this.photos,
        desc: this.description,
        heading: this.heading,
        let_sell: this.listingType,
        listingAreaType: this.listingAreaType,
        status: this.listingEditee.status === StatusEnum.SAVED ? StatusEnum.PENDING_APPROVAL : StatusEnum.EDITED,
        characteristics: {
          garden: this.garden,
          party: this.party,
          mansion: this.mansion,
          accessible: this.accessible,
          foreign: this.foreign,
          openConcept: false,
          ecoWarrior: false,
          family: false,
          student: this.students,
          lovinIt: this.food,
          farm: this.farm,
          gym: this.gym,
          owner: this.owner,
          leftUmbrella: false
        },
        listingDate: "" + new Date(),
        geometry: {
          lat: this.geometry.lat,
          lng: this.geometry.lng
        },
        pointsOfInterestIds: this.pointsOfInterestIds,
        areaScore: {
          crimeScore: 0,
          schoolScore: 0,
          waterScore: 0,
          sanitationScore: 0
        }
      };

      const resp = await this.listingService.editListing(list);
      loader.style.opacity = "0";
      property.style.opacity = "1";
      if (resp) {
        this.router.navigate(['/listing', { list: this.listingEditee.listing_id }]);
      }
    }
    return false
  }


  selectedAmenity = '';
  amenities: string[] = [
    'Pool',
    'Accessible',
    'Security Estate',
    'Flatlet',
    'Garden',
    'Pet Friendly',
    'Wifi',
    'Solar Panels'
  ];
  filteredAmenities: string[] = [];

  handleAmenityInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value.toLowerCase();

    if (inputValue.length <= 0) {
      this.filteredAmenities = [];
      return;
    }

    this.filteredAmenities = this.amenities.filter((amenity) =>
      amenity.toLowerCase().includes(inputValue)
    );
  }

  selectAmenity(amenity: string): void {
    this.selectedAmenity = amenity;
    this.filteredAmenities = [];
  }

  async calculateQualityScore(
    photos: string[],
    address: string,
    price: number,
    bedrooms: number,
    bathrooms: number,
    parking: number,
    floor_size: number,
    erf_size: number,
    pos_type: string,
    env_type: string,
    prop_type: string,
    furnish_type: string,
    orientation: string,
  ): Promise<number> {
    let score = 0;
    if (price) {
      score += 5;
    } else score -= 20;

    if (bedrooms) {
      score += 5;
    } else score -= 20;

    if (bathrooms) {
      score += 5;
    } else score -= 20;

    if (parking) {
      score += 5;
    } else score -= 20;

    if (floor_size && floor_size > 0) {
      score += 5;
    } else score -= 15;

    if (erf_size && erf_size > 0) {
      score += 5;
    } else score -= 15;

    if (this.isNonEmptyStringInput(pos_type)) {
      score += 5;
    } else score -= 15;

    if (this.isNonEmptyStringInput(env_type)) {
      score += 5;
    } else score -= 15;

    if (this.isNonEmptyStringInput(prop_type)) {
      score += 5;
    } else score -= 15;

    if (this.isNonEmptyStringInput(furnish_type)) {
      score += 5;
    } else score -= 15;

    if (this.isNonEmptyStringInput(orientation)) {
      score += 5;
    } else score -= 15;


    const isGeocodable = await this.checkGeocodableAddress(address);

    if (!isGeocodable) {
      return 0;
    }

    return score;
  }

  calculatePhotoScore(photo: string): number {
    let rating = 0;
    this.getImageDimensions(this.convertBlobUrlToNormalUrl(photo))
      .then(({ width, height }) => {
        rating = 5 * (this.min(width, height) / this.max(width, height));
        return rating;
      })
      .catch((error) => {
        console.error(error.message);
      });

    return -1;
  }

  min(first: number, second: number): number {
    const ret = first < second ? first : second;
    return ret;
  }

  max(first: number, second: number) {
    return first > second ? first : second;
  }

  convertBlobUrlToNormalUrl(blobUrl: string): string {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = blobUrl;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context is not available.");
    }
    ctx.drawImage(img, 0, 0);
    // URL.revokeObjectURL(blobUrl); // Revoke the blob URL
    return canvas.toDataURL(); // Convert to a regular data URL
  }

  //   getImageDimensions(imageUrl: string): void {
  //     const image = new Image();
  //     image.src = imageUrl;

  //     image.onload = () => {
  //       const width = image.naturalWidth;
  //       const height = image.naturalHeight;

  //       console.log(`Image dimensions: ${width} x ${height} pixels`);
  //     };
  //   }

  async checkGeocodableAddress(address: string) {
    try {
      const geocoderResult = await this.gmapsService.geocodeAddress(address);
      return geocoderResult;
    }
    catch (error) {
      console.error(error);
      return null;
    }
  }


  getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageUrl;

      image.onload = () => {
        const width = image.naturalWidth;
        const height = image.naturalHeight;

        resolve({ width, height });
      };

      image.onerror = () => {
        reject(new Error("Failed to load the image."));
      };
    });
  }

  isNumericInput(input: string): boolean {
    // Regular expression to check if the input contains only numeric characters
    const numericRegex = /^[0-9,]+$/;
    return numericRegex.test(input);
  }

  isNonEmptyStringInput(input: string): boolean {
    if (input) {
      return input.trim() !== "";
    }

    return false;
  }
}