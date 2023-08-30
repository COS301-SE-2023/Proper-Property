import { Injectable } from '@angular/core';
import { UserProfileService, UserProfileState } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { UploadCrimeStatsRequest,
  UploadCrimeStatsResponse,
  Station,
  Crime,
  UploadSaniStatsRequest,
  UploadSaniStatsResponse,
  Sanitation,
  District,
  UploadDistrictDataResponse,
  UploadDistrictDataRequest,
  WWQ} from '@properproperty/api/loc-info/util';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  currentUser: UserProfile | null = null;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;

  constructor(
    private readonly userServices: UserProfileService, 
    private readonly functions: Functions
  ) {
    this.userProfile$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  async uploadCrimeStats(crimeData : any[], quarter: string){
    let stationCount = 0;
    let encounteredStations : String[] = [];
    const stations : Station[] = [];
    for(let i = 0; i < crimeData.length; i++){
      if(encounteredStations.includes(crimeData[i]['Station'])){
        stations[encounteredStations.indexOf(crimeData[i]['Station'])].crimeStats.push({
          category: crimeData[i]['Crime_Category'],
          quarterCount: crimeData[i][quarter],
        })
      }
      else{
        encounteredStations.push(crimeData[i]['Station']);
        stations[stationCount++] = {
          stationName: crimeData[i]['Station'],
          district: crimeData[i]['District'],
          crimeStats: [{
            category: crimeData[i]['Crime_Category'],
            quarterCount: crimeData[i][quarter],
          }]
        }
      }
    }

    for(let i = 0; i < stations.length; i++){
      console.log(stations[i]);
    }

    const request: UploadCrimeStatsRequest = {
      stationStats: stations,
      quarter: ""
    };
    const response: UploadCrimeStatsResponse = (await httpsCallable<
      UploadCrimeStatsRequest,
      UploadCrimeStatsResponse
    >(this.functions, 'uploadCrimeStats')(request)).data;

    console.warn(response);
  }

  /** SANITATION STATISTICS **/

  async uploadSaniStats(saniData : any[]){
    const WSAs : Sanitation[] = []
    for(let i = 0; i < saniData.length; i++){
      WSAs.push({
        WSA: saniData[i]['WSA'],
        percentageBasicSani: saniData[i]['% Basic Sanitation']
      })

      console.log(WSAs[WSAs.length - 1]);
    }

    const response: UploadSaniStatsResponse = (await httpsCallable<
      UploadSaniStatsRequest,
      UploadSaniStatsResponse
    >(this.functions, 'uploadSaniStats')({wsaSaniStats: WSAs})).data;
  }

  async uploadWWQStats(WWQData : any[]){
    const WSAs : WWQ[] = []
    for(let i = 0; i < WWQData.length; i++){
      WSAs.push({
        WSA: WWQData[i]['WSA'],
        chemPerc: WWQData[i]['Chemical'],
        microbiologicalPerc:  WWQData[i]['Microbiological'],
        physicalPerc:  WWQData[i]['Physical'],
        monitoringPerc: WWQData[i]['Monitoring']
      })

      console.log(WSAs[WSAs.length - 1]);
    }

    // const response: UploadWWQStatsResponse = (await httpsCallable<
    //   UploadWWQStatsRequest,
    //   UploadWWQStatsResponse
    // >(this.functions, 'uploadWWQStats')({wsaWWQStats: WSAs})).data;
  }

  async uploadMuniData(muniData : any[]){
    let districtCount = 0;
    let encounteredDistricts : String[] = [];
    const districts : District[] = [];
    for(let i = 0; i < muniData.length; i++){
      if(muniData[i]['District'] == ""){
        muniData[i]['District'] = "Metro Municipalities";
      }
    }
    for(let i = 0; i < muniData.length; i++){
      if(encounteredDistricts.includes(muniData[i]['District'])){
          districts[encounteredDistricts.indexOf(muniData[i]['District'])].municipalities.push({
            name: muniData[i]['Name'] as string,
            province: muniData[i]['Province'] as string,
            population: muniData[i]['Population (2016)[3]'] as number,
            popDensity: muniData[i]['Pop. Density (per km2)'] as number,
          })
      }
      else{
          encounteredDistricts.push(muniData[i]['District']);
          districts[districtCount++] = {
            name: muniData[i]['District'],
            municipalities: [{
              name: muniData[i]['Name'],
              province: muniData[i]['Province'],
              population: muniData[i]['Population (2016)[3]'],
              popDensity: muniData[i]['Pop. Density (per km2)'],
            }]
          }       
      }
    }

    console.log(districts);

    const response: UploadDistrictDataResponse = (await httpsCallable<
      UploadDistrictDataRequest,
      UploadDistrictDataResponse
    >(this.functions, 'uploadDistrictData')({districts: districts})).data;
  }
}