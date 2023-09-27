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
import { Firestore, collection, doc, getDoc, setDoc } from '@angular/fire/firestore'
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  currentUser: UserProfile | null = null;
  @Select(UserProfileState.userProfile) userProfile$!: Observable<UserProfile | null>;
  crimeProgress = 0;
  constructor(
    private readonly functions: Functions,
    private readonly firestore: Firestore
  ) {
    this.userProfile$.subscribe((user) => {
      this.currentUser = user;
    });
  }
  crimeWeights : any = {
    "Murder": 0.097,
    "Attempted murder":0.087,
    "Culpable homicide":0.077,
    "Robbery with aggravating circumstances":0.067,
    "Common robbery":0.058,
    "Public violence":0.048,
    "Rape":0.091,
    "Sexual assault":0.082,
    "Crimen injuria":0.033,
    "Neglect and ill-treatment of children":0.037,
    "Kidnapping":0.070,
    "Abduction":0.067,
    "Assault with the intent to inflict grievous bodily harm":0.062,
    "Common assault":0.053,
    "Burglary at non-residential premises":0.048,
    "Burglary at residential premises":0.058,
    "Stock-theft":0.048,
    "Shoplifting":0.028,
    "Theft of motor vehicle and motorcycle":0.067,
    "Theft out of or from motor vehicle":0.037,
    "All theft not mentioned elsewhere":0.033,
    "Arson":0.058,
    "Malicious damage to property":0.048,
    "Commercial crime":0.058,
    "Drug-related crime":0.053,
    "Driving under the influence of alcohol or drugs":0.037,
    "Illegal possession of firearms and ammunition":0.062,
    "Carjacking":0.070,
    "Truck hijacking":0.067,
    "Robbery of cash in transit":0.067,
    "Bank robbery":0.077,
    "Robbery at residential premises":0.062,
    "Robbery at non-residential premises":0.058,
    "Attempted sexual offences":0.067,
    "Contact sexual offences":0.082,
    "Sexual offences detected as a result of police action":0.062,
    "Sexual offences":0.082,
    "TRIO crime":0.070,
    "Contact crimes (crimes against the person)":0.070,
    "Contact-related crimes":0.058,
    "Property-related crimes":0.048,
    "Other serious crimes":0.067,
    "Crime detected as a result of police action":0.033,
    "17 Community reported serious crimes":0.033
  };

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

    const request: UploadCrimeStatsRequest = {
      stationStats: stations,
      quarter: ""
    };

    // const response = (await httpsCallable<
    //   UploadLocInfoDataRequest,
    //   UploadLocInfoDataResponse
    // >(this.functions, 'uploadLocInfoData')({request: request, path: 'crime'})).data;

    try{
      const stations : string[] = [];
      // const crimeTotal : {
      //   category: string,
      //   total: number,
      //   average: number
      // }[] = [];
      // const encounteredCrimes : string[] = [];
      let districts : string[] = [];
      // const response = await admin
      //   .firestore()
      //   .collection('DistrictData')
      //   .doc('metadata')
      //   .get();
      
      // const data = response.data();
      // cloud function request size limit is 10MB, crime data is 60MB.
      // crime data is an overachiever, but we can't use the backend for this
      const districtCol = collection(this.firestore, 'DistrictData')
      const districtMetadataDocRef = doc(districtCol, 'metadata');
      const data = (await getDoc(districtMetadataDocRef)).data(); 

      if (!data || !data['districts']) { // DatA CoUld Be uNdeFInEd
        throw new Error("oh no");
      }
      districts = data['districts'];
      let progressCounter = 0;
      let percentageCounter = 0;
      for(const station of request.stationStats){
        let correctDistrict = "";
        const currentPercentage = Math.floor(progressCounter/request.stationStats.length * 100);
        if(Math.floor(currentPercentage / 10) > percentageCounter){
          ++percentageCounter;
          console.log(percentageCounter*10 + "%");
        }
        ++progressCounter;
        try{
          let levenScore = 0;
          for(const district of districts){
            const temp = this.levenshteinDistance(district.toLowerCase(), station.district.toLowerCase());
            // const temp = 1;
            
            if(temp > levenScore){
              levenScore = temp;
              correctDistrict = district;
            }
          }
        }
        catch(error : any){
          return {status: false, type: "crime", error: error.message ?? "No error message"};
        }

        if (correctDistrict === "") {
          continue;
        }

        let districtData;
        let metroMuni = false;
        try {
          if(correctDistrict.includes("Metropolitan Municipality")){
            // let metroMunis = (await admin
            //   .firestore()
            //   .doc('DistrictData/metro municipalities').get()).data();
            const metroMunis = (await getDoc(doc(districtCol, 'metro municipalities'))).data();
              if(metroMunis){
                for(const muni of metroMunis['municipalities']){
                  if(muni.name.toLowerCase().includes(correctDistrict.toLowerCase())){
                    districtData = muni;
                  }
                }
              }

              metroMuni = true;
          }
          else{
            // districtData = (await admin
            //   .firestore()
            //   .doc('DistrictData/' + correctDistrict.toLowerCase()).get()).data();
            districtData = (await getDoc(doc(districtCol, correctDistrict.toLowerCase()))).data();
          }
        } catch (error : any) {
          throw new Error("Error when trying to find district: " + correctDistrict + "\nerror:" + error.message);
        }
        station.weightedTotal = 0;
        stations.push(station.stationName.toLowerCase());
        for(const crime of station.crimeStats){
          let totalPop = 1, pop = 1;
          if (districtData) {
            if (districtData['totalPopulation'])
              totalPop = districtData['totalPopulation'];
            if (districtData['population'])
              pop = districtData['population'];
          }
          crime.perHunThou = crime.quarterCount/(metroMuni ? pop : totalPop) * 100000;
          station.weightedTotal += ((crime.quarterCount/totalPop) * 100000) * this.crimeWeights[crime.category];
        }   
      }

      request.stationStats.sort((s1: Station, s2: Station) => {
        if (s1.weightedTotal < s2.weightedTotal) return -1;
        if (s1.weightedTotal > s2.weightedTotal) return 1;
        return 0;
      });

      for(const station of request.stationStats){
        // admin
        // .firestore()
        // .collection('crimeStats/')
        // .doc(station.stationName.toLowerCase())
        // .set({score: (1 -request.stationStats.indexOf(station)/request.stationStats.length)});
        await setDoc(
          doc(
            collection(this.firestore, 'crimeStats'), 
            station.stationName.toLowerCase()
          ), {
            score: (1 -request.stationStats.indexOf(station)/request.stationStats.length)
          }
        );
      }

      // admin
      // .firestore()
      // .collection('crimeStats/')
      // .doc('metadata')
      // .set({stations: stations, countStations: request.stationStats.length});
    
      await setDoc(
        doc(
          collection(this.firestore, 'crimeStats'), 
          'metadata'
        ), {
          stations: stations, 
          countStations: request.stationStats.length
        }
      );
    }
    catch(e : any){
      return {type: "crime", status: false, error: e ? e.message : "No error message available"};
    }
    return {type: "crime", status: true};
  }

  /** SANITATION STATISTICS **/

  async uploadSaniStats(saniData : any[]){
    const WSAs : Sanitation[] = []
    for(let i = 0; i < saniData.length; i++){
      WSAs.push({
        WSA: saniData[i]['WSA'],
        percentageBasicSani: saniData[i]['% Basic Sanitation'].includes("%") ? saniData[i]['% Basic Sanitation'].substring(0, saniData[i]['% Basic Sanitation'].length - 1)/100 : null
      })
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
    }

    const request : UploadWaterAccessDataRequest = {
      wsaData: WSAs
    }

    return (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path : 'waterAccess'})).data;
  }
  

  // for(const station of request.stationStats){
  //   let correctDistrict = "";
  //   
  async uploadWaterQualityData(data : any[]){
    const runningLocally = window.location.hostname.includes("localhost");
    if(runningLocally) console.log("uploading water quality data");
    let progressCounter = 0;
    let percentageCounter = 0;
    const WSAs : waterQualityWSA[] = []
    for(let i = 0; i < data.length; i++){
      const currentPercentage = Math.floor(progressCounter/data.length * 100);
      if(Math.floor(currentPercentage / 10) > percentageCounter && runningLocally){
        ++percentageCounter;
        console.log(percentageCounter*10 + "%");
      }
      ++progressCounter;
      WSAs.push({
        wsa: data[i]['WSA'],
        chemicalAcuteHealth: data[i]['Chemical : Acute Health'].includes("%") ? data[i]['Chemical : Acute Health'].substring(0, data[i]['Chemical : Acute Health'].length - 1)/100 : null,
        chemicalAesthetic: data[i]['Chemical : Aesthetic'].includes("%") ? data[i]['Chemical : Aesthetic'].substring(0, data[i]['Chemical : Aesthetic'].length - 1)/100 : null,
        chemicalChronicHealth: data[i]['Chemical : Chronic Health'].includes("%") ? data[i]['Chemical : Chronic Health'].substring(0, data[i]['Chemical : Chronic Health'].length - 1)/100 : null,
        chemicalDisenfectant: data[i]['Chemical : Disinfectant'].includes("%") ? data[i]['Chemical : Disinfectant'].substring(0, data[i]['Chemical : Disinfectant'].length - 1)/100 : null,
        chemicalOperational: data[i]['Chemical : Operational'].includes("%") ? data[i]['Chemical : Operational'].substring(0, data[i]['Chemical : Operational'].length - 1)/100 : null,
        microbiological: data[i]['Microbiological : Acute Health'].includes("%") ? data[i]['Microbiological : Acute Health'].substring(0, data[i]['Microbiological : Acute Health'].length - 1)/100 : null
      })
    }

    const request : UploadWaterQualityDataRequest = {
      wsaData: WSAs
    }

    const response = (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path : 'waterQuality'})).data;
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
    }

    const request : UploadWaterTariffDataRequest = {
      wmaData: WSAs
    }

    return (await httpsCallable<
      UploadLocInfoDataRequest,
      UploadLocInfoDataResponse
    >(this.functions, 'uploadLocInfoData')({request: request, path : 'waterTariff'})).data;
  }

  levenshteinDistance(a: string, b: string){
    if(a.length == 0) return b.length; 
    if(b.length == 0) return a.length; 

    const matrix = [];

    // increment along the first column of each row
    let i;
    for(i = 0; i <= b.length; i++){
        matrix[i] = [i];
    }

    // increment each column in the first row
    let j;
    for(j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
        for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
            matrix[i][j] = matrix[i-1][j-1];
        } else {
            matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                    Math.min(matrix[i][j-1] + 1, // insertion
                                            matrix[i-1][j] + 1)); // deletion
        }
        }
    }

    return matrix[b.length][a.length];
  }
}