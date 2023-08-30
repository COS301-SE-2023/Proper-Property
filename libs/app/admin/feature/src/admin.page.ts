import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Listing, StatusChange } from '@properproperty/api/listings/util';
import { AuthState } from '@properproperty/app/auth/data-access';
import { ListingsService } from '@properproperty/app/listing/data-access';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { AdminService } from '@properproperty/app/admin/data-access';
import { Unsubscribe, User } from 'firebase/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'properproperty-admin-page',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage{

  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(UserProfileState.userProfileListener) userProfileListener$!: Observable<Unsubscribe | null>;
  private user: User | null = null;
  private userProfileListener: Unsubscribe | null = null;
  public adminLogged = false;
  public quarter = "";
  crimeFiles: FileList | null = null;
  sanitationFiles: FileList | null = null;
  WWQ: FileList | null = null;
  waterFiles: FileList | null = null;
  muniFiles: FileList | null = null;

  nonAppListings : Listing[] = [];
  appListings : Listing[] = [];
  isPopoverOpen = false;

  constructor(private listingServices : ListingsService,
    private router : Router,
    route : ActivatedRoute,
    private profileServices : UserProfileService,
    private adminServices : AdminService){
    this.user$.subscribe((user) => {
      this.user = user;
      this.profileServices.getUser("" + user?.uid).then((profile) => {
        if(profile !== undefined && profile){
          if(profile.admin){
            this.adminLogged = true;
          }
          else{
            router.navigate(['/home']);
          }
        }
      });
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
        const tempA2 = a.statusChanges?.[a.statusChanges.length - 1].date ?? "";
        const tempB2 = b.statusChanges?.[b.statusChanges.length - 1].date ?? "";

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
      const statusChange : StatusChange = params['statusChange'];
      if(statusChange && statusChange.adminId){
        router.navigate(['/admin']);
      }
    });
  }

  async redirectToPage(listing : Listing) {
    this.router.navigate(['/listing', {list : listing.listing_id, admin : this.user?.uid}]);
  }

  addData(){
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
    else if(type == "water"){
      this.waterFiles = (event.currentTarget as HTMLInputElement).files;
      console.log("Water files uploaded");
    }  
    else if(type == "muni"){
      this.muniFiles = (event.currentTarget as HTMLInputElement).files;
    } 
    else if(type == "WWQ"){
      this.WWQ = (event.currentTarget as HTMLInputElement).files;
    } 
  }

  processData(){
    console.log("Processing data");
    if (this.crimeFiles && this.crimeFiles.length > 0) {
      for (let index = 0; index < this.crimeFiles.length; index++) {
        if (this.crimeFiles.item(index))
          fetch(URL.createObjectURL(this.crimeFiles.item(index) as Blob)).then((response) => response.json()).then((response) =>{
              const crimeData : any = [];
              response.forEach((element : any) => {
              crimeData.push(element);
            });
            this.adminServices.uploadCrimeStats(crimeData, this.quarter);
          });
      }
    }

    if(this.sanitationFiles && this.sanitationFiles.length > 0){
      for (let index = 0; index < this.sanitationFiles.length; index++) {
        if (this.sanitationFiles.item(index))
          fetch(URL.createObjectURL(this.sanitationFiles.item(index) as Blob)).then((response) => response.json()).then((response) =>{
              const saniData : any = [];
              response.forEach((element : any) => {
              saniData.push(element);
            });
            this.adminServices.uploadSaniStats(saniData);
          });
      }
    }

    if(this.WWQ && this.WWQ.length > 0){
      for(let index = 0; index < this.WWQ.length; index++){
        if(this.WWQ.item(index))
          fetch(URL.createObjectURL(this.WWQ.item(index) as Blob)).then((response) => response.json()).then((response) =>{
            const WWQData : any = [];
            response.forEach((element : any) => {
            WWQData.push(element);
          });
          this.adminServices.uploadWWQStats(WWQData);
        });
      }
    }

    if(this.muniFiles && this.muniFiles.length > 0){
      for (let index = 0; index < this.muniFiles.length; index++) {
        if (this.muniFiles.item(index))
          fetch(URL.createObjectURL(this.muniFiles.item(index) as Blob)).then((response) => response.json()).then((response) =>{
              const muniData : any = [];
              response.forEach((element : any) => {
              muniData.push(element);
            });
            console.log(muniData);
            this.adminServices.uploadMuniData(muniData);
          });
      }
    }
    this.isPopoverOpen = false;
  }
}
