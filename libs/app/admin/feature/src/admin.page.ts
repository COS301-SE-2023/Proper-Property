import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Listing, ApprovalChange } from '@properproperty/api/listings/util';
// import { AuthState } from '@properproperty/app/auth/data-access';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { AdminService } from '@properproperty/app/admin/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import { Unsubscribe } from 'firebase/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'properproperty-admin-page',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage{

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


  nonAppListings : Listing[] = [];
  appListings : Listing[] = [];
  isPopoverOpen = false;

  constructor(private listingServices : ListingsService, private router : Router, route : ActivatedRoute, private profileServices : UserProfileService, private adminServices : AdminService){
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

    this.appListings = [];
    this.nonAppListings = [];
    let listings : Listing[] = [];
    this.listingServices.getListings().then((response) => {
      listings = response;

      for(const listing of listings){
        if(listing.approved){
          this.appListings.push(listing);
        }
        else if(!listing.approved){
          this.nonAppListings.push(listing);
        }
      }

      //sorting listings by date created
      this.appListings = this.appListings.sort((a, b) => {
        const tempA2 = a.approvalChanges?.[a.approvalChanges.length - 1].date ?? "";
        const tempB2 = b.approvalChanges?.[b.approvalChanges.length - 1].date ?? "";

        const tempA = new Date(tempA2);
        const tempB = new Date(tempB2);
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
    });
    

    route.params.subscribe((params) => {
      const ApprovalChange : ApprovalChange = params['ApprovalChange'];
      if(ApprovalChange && ApprovalChange.adminId){
        router.navigate(['/admin']);
      }
    });
  }

  async redirectToPage(listing : Listing) {
    this.router.navigate(['/listing', {list : listing.listing_id, admin : this.userProfile?.userId}]);
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
    console.log("Adding data");
  }

  handleFileInput(event: Event, type: string) {
    if (!event.currentTarget) {
      return;
    }

    console.log(type)

    if(type == "crime"){
      this.crimeFiles = (event.currentTarget as HTMLInputElement).files;
      console.log("Crime files uploaded");
    }
    else if(type == "sanitation"){
      this.sanitationFiles = (event.currentTarget as HTMLInputElement).files;
      console.log("Sanitation files uploaded");
    }
    else if(type == "waterAccess"){
      this.waterAccessFiles = (event.currentTarget as HTMLInputElement).files;
      console.log("Water Access files uploaded");
    }
    else if(type == "waterQuality"){
      this.waterQualityFiles = (event.currentTarget as HTMLInputElement).files;
      console.log("Water Quality files uploaded");
    }
    else if(type == "waterReliability"){
      this.waterReliabilityFiles = (event.currentTarget as HTMLInputElement).files;
    }
    else if(type == "waterTariffs"){
      this.waterTariffsFiles = (event.currentTarget as HTMLInputElement).files;
    }
    else if(type == "muni"){
      this.muniFiles = (event.currentTarget as HTMLInputElement).files;
    } 
    else if(type == "WWQ"){
      this.WWQ = (event.currentTarget as HTMLInputElement).files;
    }
  }

  async processData(){
    console.log("Processing data");
    if (this.crimeFiles && this.crimeFiles.length > 0) {
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
      for(let index = 0; index < this.WWQ.length; index++){
        if(this.WWQ.item(index))
          fetch(URL.createObjectURL(this.WWQ.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
            const WWQData : any = [];
            response.forEach((element : any) => {
            WWQData.push(element);
          });
          await this.adminServices.uploadWWQStats(WWQData).then((response) => {
            console.log(response);
          })
        });
      }
    }

    if(this.muniFiles && this.muniFiles.length > 0){
      for (let index = 0; index < this.muniFiles.length; index++) {
        if (this.muniFiles.item(index))
          fetch(URL.createObjectURL(this.muniFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const muniData : any = [];
              response.forEach((element : any) => {
              muniData.push(element);
            });
            console.log(muniData);
            await this.adminServices.uploadMuniData(muniData);
          });
      }
    }

    if(this.waterAccessFiles && this.waterAccessFiles.length > 0){
      for (let index = 0; index < this.waterAccessFiles.length; index++) {
        if (this.waterAccessFiles.item(index))
          fetch(URL.createObjectURL(this.waterAccessFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const waterAccessData : any = [];
              response.forEach((element : any) => {
              waterAccessData.push(element);
            });
            console.log(waterAccessData);
            await this.adminServices.uploadWaterAccessData(waterAccessData);
          });
      }
    }

    if(this.waterQualityFiles && this.waterQualityFiles.length > 0){
      for (let index = 0; index < this.waterQualityFiles.length; index++) {
        if (this.waterQualityFiles.item(index))
          fetch(URL.createObjectURL(this.waterQualityFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const waterQualityData : any = [];
              response.forEach((element : any) => {
              waterQualityData.push(element);
            });
            console.log(waterQualityData);
            await this.adminServices.uploadWaterQualityData(waterQualityData);
          });
      }
    }

    if(this.waterReliabilityFiles && this.waterReliabilityFiles.length > 0){
      for (let index = 0; index < this.waterReliabilityFiles.length; index++) {
        if (this.waterReliabilityFiles.item(index))
          fetch(URL.createObjectURL(this.waterReliabilityFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const waterReliabilityData : any = [];
              response.forEach((element : any) => {
              waterReliabilityData.push(element);
            });
            console.log(waterReliabilityData);
            await this.adminServices.uploadWaterReliabilityData(waterReliabilityData);
          });
      }
    }

    if(this.waterTariffsFiles && this.waterTariffsFiles.length > 0){
      for (let index = 0; index < this.waterTariffsFiles.length; index++) {
        if (this.waterTariffsFiles.item(index))
          fetch(URL.createObjectURL(this.waterTariffsFiles.item(index) as Blob)).then((response) => response.json()).then(async (response) =>{
              const waterTariffData : any = [];
              response.forEach((element : any) => {
              waterTariffData.push(element);
            });
            console.log(waterTariffData);
            await this.adminServices.uploadWaterTariffData(waterTariffData);
          });
      }
    }
    this.isPopoverOpen = false;
  }
}
