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
  Sanitation} from '@properproperty/api/loc-info/util';
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
          crimeStats: [{
            category: crimeData[i]['Crime_Category'],
            quarterCount: crimeData[i][quarter],
          }]
        }

        console.log(i + " : " + stations[crimeData[i]['Station']]);
        console.log(stations.length);
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
}