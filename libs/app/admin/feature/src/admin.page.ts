import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Listing, StatusChange } from '@properproperty/api/listings/util';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { AdminService } from '@properproperty/app/admin/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import { Unsubscribe } from 'firebase/auth';
import { Observable } from 'rxjs';
import { Storage, ref } from "@angular/fire/storage";
import { getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'properproperty-admin-page',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit{

  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private userProfile: UserProfile | null = null;
  private userProfileListener: Unsubscribe | null = null;
  public adminLogged = false;
  public quarter = "";
  crimeFiles: FileList | null = null;
  sanitationFiles: FileList | null = null;
  WWQ: FileList | null = null;
  waterAccessFiles: FileList | null = null;
  waterQualityFiles: FileList | null = null;
  waterReliabilityFiles: FileList | null = null;
  waterTariffsFiles: FileList | null = null;
  muniFiles: FileList | null = null;
  muniUploaded = false;
  selectedFiles: string[] = [];
  loading = false;
  loadingMessage = "";
  nonAppListings : Listing[] = [];
  appListings : Listing[] = [];
  isPopoverOpen = false;

  constructor(
    private listingServices : ListingsService, 
    private router : Router, 
    route : ActivatedRoute, 
    private profileServices : UserProfileService, 
    public adminServices : AdminService,
    private readonly storage: Storage
  ){
    this.userProfile$.subscribe((profile) => {
      this.userProfile = profile;
        if(profile !== undefined && profile){
          if(profile.admin){
            this.adminLogged = true;
          }
          else{
            router.navigate(['/home']);
          }}
      });

    // Update listener whenever is changes such that it can be unsubscribed from
    // when the window is unloaded
    this.userProfileListener$.subscribe((listener) => {
      this.userProfileListener = listener;
    });
    

    route.params.subscribe((params) => {
      const ApprovalChange : StatusChange = params['ApprovalChange'];
      if(ApprovalChange?.adminId){
        router.navigate(['/admin']);
      }
    });
  }

  async redirectToPage(listing : Listing) {
    this.router.navigate(['/listing', {list : listing.listing_id, admin : this.userProfile?.userId}]);
  }
  sacredTomeLocation = "https://libraryofbabel.info/random.cgi";
  async ngOnInit() {
    try {
      this.sacredTomeLocation = await this.getAdminHelpGuide();
    } catch (e) {
      console.log("Figure it out");
    }
    this.loadingMessage = "Loading Unapproved Listings...";
    this.loading = true;
    this.nonAppListings = [];      
    this.nonAppListings = await this.listingServices.getUnapprovedListings();

    this.nonAppListings = this.nonAppListings.sort((a, b) => {
      const tempA = new Date(a.listingDate);
      const tempB = new Date(b.listingDate);
      if(tempA > tempB){
        return -1
      }
      else if(tempA < tempB){
        return 1;
      }
      else{
        return 0;
      }
    })

    setTimeout(async () => {
      this.loading = false;
    }, 3000)
  }
  
  async getAdminHelpGuide(){
    const response = await getDownloadURL(ref(this.storage, process.env['NX_FIREBASE_STORAGE_BUCKET'] + "/help-guide/admin-help-guide.pdf"));
    return response;
  }

  addData(){
    this.crimeFiles = null;
    this.sanitationFiles = null;
    this.waterAccessFiles = null;
    this.waterQualityFiles = null;
    this.waterReliabilityFiles = null;
    this.waterTariffsFiles = null;
    this.muniFiles = null;
    this.WWQ = null;
    this.isPopoverOpen = true;
  }

  handleFileInput(event: Event, type: string) {
    if (!event.currentTarget) {
      return;
    }
    const files: FileList | null = (event.currentTarget as HTMLInputElement).files;
    if (!files) {
      return;
    }

    if(type == "crime" && files[0]['name'].toLowerCase().includes("crime")){
      this.crimeFiles = files;
    }
    else if(type == "sanitation" && files[0]['name'].toLowerCase().includes("sanitation")){
      this.sanitationFiles = files;
    }
    else if(type == "waterAccess" && files[0]['name'].toLowerCase().includes("access")){
      this.waterAccessFiles = files;
    }
    else if (type == "waterQuality" && files[0]['name'].toLowerCase().includes("quality")){
      this.waterQualityFiles = files;
    }
    else if (type == "waterReliability" && files[0]['name'].toLowerCase().includes("reliability")){
      this.waterReliabilityFiles = files;
    }
    else if (type == "waterTariffs" && files[0]['name'].toLowerCase().includes("tariffs")){
      this.waterTariffsFiles = files;
    }
    else if (type == "muni" && files[0]['name'].toLowerCase().includes("municipality")){
      this.muniFiles = files;
      this.muniUploaded = true;
    } 
    else if(type == "WWQ" && files[0]['name'].toLowerCase().includes("wwq")){
      this.WWQ = files;
    }
    else{
      return;
    }
    const pos = this.selectedFiles.indexOf(files[0]['name']);
    if (pos > -1) {
      this.selectedFiles.splice(pos,1, files[0]['name']);
    }
    else {
      this.selectedFiles.push(files[0]['name']);
    }
  }

  async processData(){
    const runningLocally = window.location.hostname.includes("localhost");
    if(this.muniFiles && this.muniFiles.length > 0){
      if (runningLocally) console.log("Adding Municipality Data");
      for (let index = 0; index < this.muniFiles.length; index++) {
        if (this.muniFiles.item(index)){
          const response = await fetch(URL.createObjectURL(this.muniFiles.item(index) as Blob));
          const jsonResponse = await response.json();
          const muniData : any[] = [];
          await jsonResponse.forEach((element : any) => {
            muniData.push(element);  
          });
          await this.adminServices.uploadMuniData(muniData);
        }
      }
    }
    if (this.crimeFiles && this.crimeFiles.length > 0) {
      if (runningLocally) console.log("Adding Crime Data");
      for (let index = 0; index < this.crimeFiles.length; index++) {
        if (this.crimeFiles.item(index))
          fetch(URL.createObjectURL(this.crimeFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const crimeData : any = [];
              response.forEach((element : any) => {
              crimeData.push(element);
            });
            await this.adminServices.uploadCrimeStats(crimeData, this.quarter);
          });
      }
    }

    if(this.sanitationFiles && this.sanitationFiles.length > 0){
      if (runningLocally) console.log("Adding Sanitation Data");
      for (let index = 0; index < this.sanitationFiles.length; index++) {
        if (this.sanitationFiles.item(index))
          fetch(URL.createObjectURL(this.sanitationFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const saniData : any = [];
              response.forEach((element : any) => {
              saniData.push(element);
            });
            await this.adminServices.uploadSaniStats(saniData);
          });
      }
    }

    if(this.WWQ && this.WWQ.length > 0){
      if (runningLocally) console.log("Adding WWQ Data");
      for(let index = 0; index < this.WWQ.length; index++){
        if(this.WWQ.item(index))
          fetch(URL.createObjectURL(this.WWQ.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
            const WWQData : any = [];
            response.forEach((element : any) => {
            WWQData.push(element);
          });
          await this.adminServices.uploadWWQStats(WWQData);
        });
      }
    }

    if(this.waterAccessFiles && this.waterAccessFiles.length > 0){
      if (runningLocally) console.log("Adding Water Access Data");
      for (let index = 0; index < this.waterAccessFiles.length; index++) {
        if (this.waterAccessFiles.item(index))
          fetch(URL.createObjectURL(this.waterAccessFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const waterAccessData : any = [];
              response.forEach((element : any) => {
              waterAccessData.push(element);
            });
            await this.adminServices.uploadWaterAccessData(waterAccessData);
          });
      }
    }

    if(this.waterQualityFiles && this.waterQualityFiles.length > 0){
      if (runningLocally) console.log("Adding Water Quality Data");
      for (let index = 0; index < this.waterQualityFiles.length; index++) {
        if (this.waterQualityFiles.item(index))
          fetch(URL.createObjectURL(this.waterQualityFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const waterQualityData : any = [];
              response.forEach((element : any) => {
              waterQualityData.push(element);
            });
            await this.adminServices.uploadWaterQualityData(waterQualityData);
          });
      }
    }

    if(this.waterReliabilityFiles && this.waterReliabilityFiles.length > 0){
      if (runningLocally) console.log("Adding Water Reliability Data");
      for (let index = 0; index < this.waterReliabilityFiles.length; index++) {
        if (this.waterReliabilityFiles.item(index))
          fetch(URL.createObjectURL(this.waterReliabilityFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const waterReliabilityData : any = [];
              response.forEach((element : any) => {
              waterReliabilityData.push(element);
            });
            await this.adminServices.uploadWaterReliabilityData(waterReliabilityData);
          });
      }
    }

    if(this.waterTariffsFiles && this.waterTariffsFiles.length > 0){
      if (runningLocally) console.log("Adding Water Tariff Data");
      for (let index = 0; index < this.waterTariffsFiles.length; index++) {
        if (this.waterTariffsFiles.item(index))
          fetch(URL.createObjectURL(this.waterTariffsFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const waterTariffData : any = [];
              response.forEach((element : any) => {
              waterTariffData.push(element);
            });
            await this.adminServices.uploadWaterTariffData(waterTariffData);
          });
      }
    }
    this.isPopoverOpen = false;
  }
}
