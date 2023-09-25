import { Injectable } from '@angular/core';
import { UserProfileState } from '@properproperty/app/profile/data-access';
import { UserProfile } from '@properproperty/api/profile/util';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { Station,
  Sanitation,
  District,
  WWQ,
  UploadLocInfoDataRequest,
  UploadLocInfoDataResponse,
  UploadCrimeStatsRequest,
  UploadSaniStatsRequest,
  UploadDistrictDataRequest,
  UploadWWQStatsRequest,
  waterAccessWSA,
  UploadWaterAccessDataRequest,
  waterQualityWSA,
  UploadWaterQualityDataRequest,
  waterReliabilityWSA,
  UploadWaterReliabilityDataRequest,
  waterTariffWMA,
  UploadWaterTariffDataRequest} from '@properproperty/api/loc-info/util';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  currentUser: UserProfile | null = null;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;

  constructor(
    private readonly functions: Functions
  ) {
    this.userProfile$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  async uploadCrimeStats(crimeData : any[], quarter: string){
    let stationCount = 0;
    const encounteredStations : string[] = [];
    const stations : Station[] = [];
    for(let i = 0; i < crimeData.length; i++){
      if(encounteredStations.includes(crimeData[i]['Station'])){
        stations[encounteredStations.indexOf(crimeData[i]['Station'])].crimeStats.push({
          category: crimeData[i]['Crime_Category'],
          quarterCount: crimeData[i][quarter],
          incDec: crimeData[i]['Count direction'],
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
            incDec: crimeData[i]['Count direction']
          }],
          weightedTotal: 0,
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

    const response = (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path: 'crime'})).data;
    if (response.status) {
      console.log(response);
    }
    else {
      console.error(response);
    }

    return response;
  }

  /** SANITATION STATISTICS **/

  async uploadSaniStats(saniData : any[]){
    const WSAs : Sanitation[] = []
    for(let i = 0; i < saniData.length; i++){
      WSAs.push({
        WSA: saniData[i]['WSA'],
        percentageBasicSani: saniData[i]['% Basic Sanitation'].includes("%") ? saniData[i]['% Basic Sanitation'].substring(0, saniData[i]['% Basic Sanitation'].length - 1)/100 : null
      })

      console.log(WSAs[WSAs.length - 1]);
    }

    const request : UploadSaniStatsRequest = {
      wsaSaniStats: WSAs
    }

    return (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path: 'sani'})).data;
  }

  async uploadWWQStats(WWQData : any[]){
    const WSAs : WWQ[] = []
    for(let i = 0; i < WWQData.length; i++){
      WSAs.push({
        WSA: WWQData[i]['WSA'],
        chemPerc: WWQData[i]['Chemical'].includes("%") ? WWQData[i]['Chemical'].substring(0, WWQData[i]['Chemical'].length - 1)/100 : null,
        microbiologicalPerc:  WWQData[i]['Microbiological'].includes("%") ? WWQData[i]['Microbiological'].substring(0, WWQData[i]['Microbiological'].length - 1)/100 : null,
        physicalPerc:  WWQData[i]['Physical'].includes("%") ? WWQData[i]['Physical'].substring(0, WWQData[i]['Physical'].length - 1)/100 : null,
        monitoringPerc: WWQData[i]['Monitoring'].includes("%") ? WWQData[i]['Monitoring'].substring(0, WWQData[i]['Monitoring'].length - 1)/100 : null
      })

      console.log(WSAs[WSAs.length - 1]);
    }

    const request : UploadWWQStatsRequest = {
      wsaWWQStats: WSAs
    }

    return (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path : 'wwq'})).data;
  }

  async uploadMuniData(muniData : any[]){
    let districtCount = 0;
    const encounteredDistricts : string[] = [];
    const districts : District[] = [];
    const re = /,/gi;

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
          population: parseFloat(("" + muniData[i]['Population (2016)[3]']).replace(re, "")),
          popDensity: parseFloat(("" +  muniData[i]['Pop. Density (per km2)']).replace(re, "")),
        })
      }
      else{
          encounteredDistricts.push(muniData[i]['District']);          
          districts[districtCount++] = {
            name: muniData[i]['District'],
            municipalities: [{
              name: muniData[i]['Name'],
              province: muniData[i]['Province'],
              population: parseFloat(("" + muniData[i]['Population (2016)[3]']).replace(re, "")),
              popDensity: parseFloat(("" +  muniData[i]['Pop. Density (per km2)']).replace(re, "")),
            }]
          }       
      }
    }

    const request : UploadDistrictDataRequest = {
      districts: districts,
      metadata: encounteredDistricts
    }

    console.log(districts);

    return (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path: 'district'})).data;
  }

  async uploadWaterAccessData(data : any[]){
    const WSAs : waterAccessWSA[] = []
    for(let i = 0; i < data.length; i++){
      WSAs.push({
        wsa: data[i]['WSA'],
        population: data[i]['Population'],
        accessPercentage: data[i]['%Population  with access'].includes("%") ? data[i]['%Population  with access'].substring(0, data[i]['%Population  with access'].length - 1)/100 : null
      })

      console.log(WSAs[WSAs.length - 1]);
    }

    const request : UploadWaterAccessDataRequest = {
      wsaData: WSAs
    }

    return (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path : 'waterAccess'})).data;
  }

  async uploadWaterQualityData(data : any[]){
    const WSAs : waterQualityWSA[] = []
    for(let i = 0; i < data.length; i++){
      WSAs.push({
        wsa: data[i]['WSA'],
        chemicalAcuteHealth: data[i]['Chemical : Acute Health'].includes("%") ? data[i]['Chemical : Acute Health'].substring(0, data[i]['Chemical : Acute Health'].length - 1)/100 : null,
        chemicalAesthetic: data[i]['Chemical : Aesthetic'].includes("%") ? data[i]['Chemical : Aesthetic'].substring(0, data[i]['Chemical : Aesthetic'].length - 1)/100 : null,
        chemicalChronicHealth: data[i]['Chemical : Chronic Health'].includes("%") ? data[i]['Chemical : Chronic Health'].substring(0, data[i]['Chemical : Chronic Health'].length - 1)/100 : null,
        chemicalDisenfectant: data[i]['Chemical : Disinfectant'].includes("%") ? data[i]['Chemical : Disinfectant'].substring(0, data[i]['Chemical : Disinfectant'].length - 1)/100 : null,
        chemicalOperational: data[i]['Chemical : Operational'].includes("%") ? data[i]['Chemical : Operational'].substring(0, data[i]['Chemical : Operational'].length - 1)/100 : null,
        microbiological: data[i]['Microbiological : Acute Health'].includes("%") ? data[i]['Microbiological : Acute Health'].substring(0, data[i]['Microbiological : Acute Health'].length - 1)/100 : null
      })

      console.log(WSAs[WSAs.length - 1]);
    }

    const request : UploadWaterQualityDataRequest = {
      wsaData: WSAs
    }

    const response = (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path : 'waterQuality'})).data;

    console.log("ADMIN SERVICES - WATER QUALITY RESPONSE: ", response)
    return response;
  }

  async uploadWaterReliabilityData(data : any[]){
    const WSAs : waterReliabilityWSA[] = []
    for(let i = 0; i < data.length; i++){
      WSAs.push({
        wsa: data[i]['WSA Name'],
        urbanPopulation: data[i]['Urban Population'],
        ruralPopulation: data[i]['Rural Population'],
        urbanPopAccess: data[i]['Urban Population with access to water'],
        ruralPopAccess: data[i]['Rural Population with access to water'],
        urbanPopReliable: data[i]['Urban Population Reliable Supply'],
        ruralPopReliable: data[i]['Rural Population Reliable Supply']
      })

      console.log(WSAs[WSAs.length - 1]);
    }

    const request : UploadWaterReliabilityDataRequest = {
      wsaData: WSAs
    }

    return (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path : 'waterReliability'})).data;
  }

  async uploadWaterTariffData(data : any[]){
    const WSAs : waterTariffWMA[] = []
    for(let i = 0; i < data.length; i++){
      WSAs.push({
        wma : data[i]['WMA'],
        domesticTariff: data[i]['Domestic and Industry c/m3'],
        irrigationTariff: data[i]['Irrigation c/m3'],
        forestryTariff: data[i]['Forestry c/m3']
      })

      console.log(WSAs[WSAs.length - 1]);
    }

    const request : UploadWaterTariffDataRequest = {
      wmaData: WSAs
    }

    return (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path : 'waterTariff'})).data;
  }
}