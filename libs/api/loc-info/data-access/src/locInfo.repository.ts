import { Injectable } from '@nestjs/common';
import {  UploadLocInfoDataResponse,
  UploadCrimeStatsRequest, 
  UploadSaniStatsRequest,
  UploadDistrictDataRequest,
  UploadWWQStatsRequest,
  UploadWaterAccessDataRequest,
  UploadWaterQualityDataRequest,
  UploadWaterReliabilityDataRequest,
  UploadWaterTariffDataRequest,
  GetLocInfoDataRequest,
  GetLocInfoDataResponse} from '@properproperty/api/loc-info/util';
import {Station} from '@properproperty/api/loc-info/util';
import * as admin from 'firebase-admin';

@Injectable()
export class LocInfoRepository {
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

  async uploadCrimeStats(req : UploadCrimeStatsRequest): Promise<UploadLocInfoDataResponse>{
    var natural = require('natural');
    try{

      const stations : string[] = [];
      // const crimeTotal : {
      //   category: string,
      //   total: number,
      //   average: number
      // }[] = [];
      // const encounteredCrimes : string[] = [];
      let districts : string[] = [];

      const response = await admin
        .firestore()
        .collection('DistrictData')
        .doc('metadata')
        .get();
      
      const data = response.data();
      if (!data || !data['districts']) { // DatA CoUld Be uNdeFInEd
        throw new Error("oh no");
      }
      districts = data['districts'];

      for(let station of req.stationStats){
        let correctDistrict = "";

        try{
          let levenScore = 0;
          for(let district of districts){
            const temp = natural.LevenshteinDistance(district.toLowerCase(), station.district.toLowerCase());
            
            if(temp > levenScore){
              levenScore = temp;
              correctDistrict = district;
            }
          }
        }
        catch(error : any){
          console.log("Error when calculating leven score: ", error.message ?? "No error message");
        }

        if (correctDistrict === "") {
          console.log(station.district + " not found");
          continue;
        }

        let districtData;
        let metroMuni = false;
        try {
          if(correctDistrict.includes("Metropolitan Municipality")){
            let metroMunis = (await admin
              .firestore()
              .doc('DistrictData/metro municipalities').get()).data();

              for(let muni of metroMunis?.['municipalities']){
                if(muni.name.toLowerCase().includes(correctDistrict.toLowerCase())){
                  districtData = muni;
                }
              }

              metroMuni = true;
          }
          else{
            districtData = (await admin
              .firestore()
              .doc('DistrictData/' + correctDistrict.toLowerCase()).get()).data();
          }
        } catch (error : any) {
          throw new Error("Error when trying to find district: " + correctDistrict + "\nerror:" + error.message);
        }
        station.weightedTotal = 0;
        stations.push(station.stationName.toLowerCase());
        for(let crime of station.crimeStats){
          crime.perHunThou = (crime.quarterCount/(metroMuni ? districtData?.['population'] : districtData?.['totalPopulation']) ?? 1) * 100000;
          
          station.weightedTotal += ((crime.quarterCount/districtData?.['totalPopulation'] ?? 1) * 100000) * this.crimeWeights[crime.category];
        }   
      }

      req.stationStats.sort((s1: Station, s2: Station) => {
        if (s1.weightedTotal < s2.weightedTotal) return -1;
        if (s1.weightedTotal > s2.weightedTotal) return 1;
        return 0;
      });

      for(let station of req.stationStats){
        admin
        .firestore()
        .collection('crimeStats/')
        .doc(station.stationName.toLowerCase())
        .set({score: (1 -req.stationStats.indexOf(station)/req.stationStats.length)});
      }

      admin
      .firestore()
      .collection('crimeStats/')
      .doc('metadata')
      .set({stations: stations, countStations: req.stationStats.length});
    
      return {type: "crime", status: true};
    }
    catch(e : any){
      console.log(e);
      return {type: "crime", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadSaniStats(req : UploadSaniStatsRequest): Promise<UploadLocInfoDataResponse>{
    try{
      const WSAs = [];
      for(let wsa of req.wsaSaniStats){
        if(wsa.WSA.toLowerCase().includes("/")){
          wsa.WSA = wsa.WSA.replace("/", "-").toLowerCase();
        }

        WSAs.push(wsa.WSA);

        admin
        .firestore()
        .collection('SaniStats-Sanitation')
        .doc(wsa.WSA.toLowerCase())
        .set(wsa);
      }

      admin.
      firestore().
      collection('SaniStats-Sanitation/').
      doc('metadata').
      set({WSAs : WSAs});
    
      return {type: "sanitation", status: true};
    }
    catch(e : any){
      return {type: "crime", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadWWQStats(req : UploadWWQStatsRequest): Promise<UploadLocInfoDataResponse>{
    try{
      const WSAs = [];
      for(let wsa of req.wsaWWQStats){
        if(wsa.WSA.toLowerCase().includes("/")){
          wsa.WSA = wsa.WSA.replace("/", "-").toLowerCase();
        }
        
        WSAs.push(wsa.WSA)
        admin
        .firestore()
        .collection('SaniStats-WWQ')
        .doc(wsa.WSA.toLowerCase())
        .set(wsa);
      }
    
      admin.
      firestore().
      collection('SaniStats-WWQ/').
      doc('metadata').
      set({WSAs : WSAs});

      return {type: "wwq", status: true};
    }
    catch(e : any){
      return {type: "crime", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadDistrictData(req : UploadDistrictDataRequest): Promise<UploadLocInfoDataResponse>{
    try{  
      for(let district of req.districts){
        if(district.name == "Metro Municipalities"){
          for(let muni of district.municipalities){
            req.metadata.push(muni.name);
          }
        }

        let totalPopulation = 0;
        for(let muni of district.municipalities){
          totalPopulation += muni.population
        }

        admin
        .firestore()
        .collection('DistrictData/')
        .doc(district.name.toLowerCase())
        .set({...district, totalPopulation: totalPopulation});
      }

      admin
      .firestore()
      .collection('DistrictData/')
      .doc('metadata')
      .set({districts: req.metadata});
    
      return {type: "district", status: true};
    }
    catch(e : any){
      return {type: "district", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadWaterAccessStats(req : UploadWaterAccessDataRequest): Promise<UploadLocInfoDataResponse>{
    try{
      const WSAs = [];
      // let totalPop = 0;
      for(let wsa of req.wsaData){
        if(wsa.wsa.toLowerCase().includes("/")){
          wsa.wsa = wsa.wsa.replace("/", "-").toLowerCase();
        }

        WSAs.push(wsa.wsa);
        // totalPop += wsa.population;
        admin
        .firestore()
        .collection('WaterStats-Access/')
        .doc(wsa.wsa.toLowerCase())
        .set(wsa);
      }

      admin.
      firestore().
      collection('WaterStats-Access/').
      doc('metadata').
      set({WSAs : WSAs});
    
      return {type: "waterAccess", status: true};
    }
    catch(e : any){
      return {type: "waterAccess", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadWaterQualityStats(req : UploadWaterQualityDataRequest): Promise<UploadLocInfoDataResponse>{
    try{
      const WSAs = [];
      for(let wsa of req.wsaData){
        if(wsa.wsa.toLowerCase().includes("/")){
          wsa.wsa = wsa.wsa.replace("/", "-");
        }

        WSAs.push(wsa.wsa.toLowerCase());
        admin
        .firestore()
        .collection('WaterStats-Quality/')
        .doc(wsa.wsa.toLowerCase())
        .set(wsa);
      }

      admin.
      firestore().
      collection('WaterStats-Quality/').
      doc('metadata').
      set({WSAs: WSAs});
    
      return {type: "waterQuality", status: true};
    }
    catch(e : any){
      return {type: "waterQuality", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadWaterReliabilityStats(req : UploadWaterReliabilityDataRequest): Promise<UploadLocInfoDataResponse>{
    try{
      const WSAs = [];
      for(let wsa of req.wsaData){
        WSAs.push(wsa.wsa.toLowerCase());
        admin
        .firestore()
        .collection('WaterStats-Reliability/')
        .doc(wsa.wsa.toLowerCase())
        .set(wsa);
      }
    
      admin.
      firestore().
      collection('WaterStats-Reliability/').
      doc('metadata').
      set({WSAs: WSAs});

      return {type: "waterReliability", status: true};
    }
    catch(e : any){
      return {type: "waterReliability", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadWaterTariffStats(req : UploadWaterTariffDataRequest): Promise<UploadLocInfoDataResponse>{
    try{
      let avgDomesticTariff = 0;
      let avgIrrigationTariff = 0;
      let count = 0;
      const WMAs = [];
      
      for(let wma of req.wmaData){
        count++;
        avgDomesticTariff += wma.domesticTariff;
        avgIrrigationTariff += wma.irrigationTariff;
        WMAs.push(wma.wma.toLowerCase());
        admin
        .firestore()
        .collection('WaterStats-Tariffs/')  
        .doc(wma.wma.toLowerCase())
        .set(wma);
      }

      admin
      .firestore()
      .collection('WaterStats-Tariffs/')
      .doc('metadata')
      .set({avgDomesticTariff: avgDomesticTariff / count, avgIrrigationTariff: avgIrrigationTariff / count, WMAs: WMAs});
    
      return {type: "waterTariff", status: true};
    }
    catch(e : any){
      return {type: "waterTariff", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async getSaniData(req: GetLocInfoDataRequest): Promise<GetLocInfoDataResponse>{
    try{    
      const saniWSAs : string[] = [];
      const wwqWSAs :string[] = [];
      await admin.
      firestore().
      doc('SaniStats-Sanitation/metadata').
      get().
      then((response) =>{
        for(let res of response.data()?.['WSAs']){
          saniWSAs.push(res);
        }
      })

      await admin.
      firestore().
      doc('SaniStats-WWQ/metadata').
      get().
      then((response) =>{
        for(let res of response.data()?.['WSAs']){
          wwqWSAs.push(res);
        }
      })

      let saniWSA = "";
      let wwqWSA = "";

      for(let wsa of saniWSAs){
        if(wsa.toLowerCase().includes("" + req.district?.toLowerCase())){
          saniWSA = wsa.toLowerCase();
        }
      }

      for(let wsa of wwqWSAs){
        if(wsa.toLowerCase().includes("" + req.district?.toLowerCase())){
          wwqWSA = wsa.toLowerCase();
        }
      }

      let percBasicSani : any;
      let percChemical : any;
      let percMicro : any;
      let percPhysical : any;
      let percMonitoring : any;

      // await admin.
      // firestore().
      // collection('SaniStats-Sanitation').
      // where("WSA", )
      await admin.
      firestore().
      doc('SaniStats-Sanitation/' + saniWSA).
      get().
      then((response) => {
          percBasicSani = response.data()?.['percentageBasicSani'];
      });  

      await admin.
      firestore().
      doc('SaniStats-WWQ/' + wwqWSA).
      get().
      then((response) => {
          percChemical = response.data()?.['chemPerc'];
          percMicro = response.data()?.['microbiologicalPerc'];
          percPhysical = response.data()?.['monitoringPerc'];
          percMonitoring = response.data()?.['physicalPerc'];
        });  

      const percentage = (percBasicSani+ percChemical + percMicro + percPhysical + percMonitoring) / 5;

      return {status: true, type: 'sanitation', percentage: percentage};
    }
    catch(e : any){
      return {status: false, type:'sanitation', error: e ? e.message : "No error message available"};
    }
  }

  async getWaterScore(req: GetLocInfoDataRequest): Promise<GetLocInfoDataResponse>{
    try{
      const accessWSAs : string[] = [];
      const qualityWSAs : string[] = [];
      const reliabilityWSAs : string[] = [];
      let count = 0;
      await admin.
        firestore().
        doc('WaterStats-Access/metadata').
        get().
        then((response) =>{
          for(let res of response.data()?.['WSAs']){
            accessWSAs.push(res);
          }
        })

      console.log(count++)

      await admin.
      firestore().
      doc('WaterStats-Quality/metadata').
      get().
      then((response) =>{
        for(let res of response.data()?.['WSAs']){
          qualityWSAs.push(res);
        }
      })

      console.log(count++)
      
      await admin.
      firestore().
      doc('WaterStats-Reliability/metadata').
      get().
      then((response) =>{
        for(let res of response.data()?.['WSAs']){
          reliabilityWSAs.push(res);
        }
      })

      console.log(count++)

      let accessWSA = "";
      let qualityWSA = "";
      let reliabilityWSA = "";
      for(let wsa of accessWSAs){
        if(wsa.toLowerCase().includes("" + req.district?.toLowerCase())){
          accessWSA = wsa;
        }
      }
      for(let wsa of qualityWSAs){
        if(wsa.toLowerCase().includes("" + req.district?.toLowerCase())){
          qualityWSA = wsa;
        }
      }
      for(let wsa of reliabilityWSAs){
        if(wsa.toLowerCase().includes("" + req.district?.toLowerCase())){
          reliabilityWSA = wsa;
        }
      }

      console.log(count++)

      let accessScore = 0;
      let qualityScore = 0;
      let reliabilityScore = 0;
      let tariffScore = 0;
      
      //TODO - Improve equation
      await admin.
      firestore().
      doc('WaterStats-Access/' + accessWSA.toLowerCase()).
      get().
      then((response) =>{
        accessScore += response.data()?.['accessPercentage'];
      })

      console.log(count++)

      await admin.
      firestore().
      doc('WaterStats-Quality/' + qualityWSA).
      get().
      then((response) =>{
        let totalQ = 0;
        totalQ = (response.data()?.['chemicalAcuteHealth'] != null ? response.data()?.['chemicalAcuteHealth'] : 0) + 
          (response.data()?.['chemicalChronicHealth'] != null ? response.data()?.['chemicalChronicHealth'] : 0) +
          (response.data()?.['microbiological'] != null ? response.data()?.['microbiological'] : 0) +
          (response.data()?.['chemicalAesthetic'] != null ? response.data()?.['chemicalAesthetic'] : 0) +
          (response.data()?.['chemicalDisenfectant'] != null ? response.data()?.['chemicalDisenfectant'] : 0) +
          (response.data()?.['chemicalOperational'] != null ? response.data()?.['chemicalOperational'] : 0);
        qualityScore = totalQ / 6;
      })

      console.log(count++)

      //TODO - fix reliability score - returning 0 each time
      await admin.
      firestore().
      doc('WaterStats-Reliability/' + reliabilityWSA).
      get().
      then((response) => {
        if(req.listingAreaType?.toLowerCase().includes("rural")){
          if(response.data()?.['ruralPopReliable'] != "" && response.data()?.['ruralPopAccess'] != ""){
            reliabilityScore = parseInt(response.data()?.['ruralPopReliable'])/parseInt(response.data()?.['ruralPopAccess']);
          }
          else{
            console.log("None for you - rural");
            reliabilityScore = 0;
          } 
        }
        else if(req.listingAreaType?.toLowerCase().includes("urban")){
          if(response.data()?.['urbanPopReliable'] != "" && response.data()?.['urbanPopAccess'] != ""){
            reliabilityScore = parseInt(response.data()?.['urbanPopReliable'])/parseInt(response.data()?.['urbanPopAccess']);
          }
          else{
            console.log("None for you - urban");
            reliabilityScore = 0;
          } 
        }
        else{
          console.log("Could not determine listingAreaType");
        }
      })

      console.log(count++)

      //WMA tariff calculations
      let WMA = "";
      let url = "https://services3.arcgis.com/QdLJLZBqzVAhCil8/arcgis/rest/services/WMA_2012/FeatureServer/0/query?where=1%3D1&outFields=WMA_NAME&geometry=" 
      + req.latlong?.lat 
      + "%2C" + req.latlong?.long 
      + "%2C" + req.latlong?.lat 
      + "%2C" + req.latlong?.long + "&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json";

      fetch(url, { method: 'GET' })
      .then(Result => Result.json())
      .then((response) => {
        WMA = response.data?.['features']?.[0]?.['attributes']?.['WMA_NAME'];
      });

      console.log(count++)

      let avgDomesticTariff = 0;
      let avgIrrigationTariff = 0;

      let WMAs : string[] = [];

      await admin
        .firestore()
        .doc("WaterStats-Tariffs/metadata")
        .get()
        .then((response) => {
          avgDomesticTariff = response.data()?.['avgDomesticTariff'];
          avgIrrigationTariff = response.data()?.['avgIrrigationTariff'];
          for(let wma of response.data()?.['WMAs']){
            WMAs.push(wma);
          }
        })

        console.log(count++)

      let tariffWMA = "";
      for(let wma of WMAs){
        if(wma.includes(WMA)){
          tariffWMA = wma;
        }
      }

      await admin
        .firestore()
        .doc("WaterStats-Tariffs/" + tariffWMA)
        .get()
        .then((response) => {
          if(req.listingType == "Commercial Property"){
            tariffScore = 1 - (response.data()?.['irrigationTariff'] + response.data()?.['domesticTariff']) 
            / (avgDomesticTariff + avgIrrigationTariff);
          }
          else if(req.listingType == "House" || req.listingType =="Apartment"){
            tariffScore = 1 - response.data()?.['domesticTariff'] / avgDomesticTariff;
          }
        })

      const waterScore = (accessScore + qualityScore + reliabilityScore + tariffScore) / 4;

      return {type: "waterScore", status: true, percentage: waterScore};
    }
    catch(e : any){
      return {type: "waterScore", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async getCrimeScore(req : GetLocInfoDataRequest): Promise<GetLocInfoDataResponse>{
    try{
      let url = "https://services.arcgis.com/k7HsiFEIdlPzZNnP/arcgis/rest/services/South_African_police_boundaries/FeatureServer/0/query?where=1%3D1&outFields=*&geometry=" 
      + req.latlong?.long
      + "%2C" + req.latlong?.lat 
      + "%2C" + req.latlong?.long 
      + "%2C" + req.latlong?.lat + " &geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json";

      const stationResponse = (await(await fetch(url, { method: 'GET' })).json());
      const foundStation = stationResponse?.['features'][0]?.['attributes']?.['COMPNT_NM'];

      let correctStation = "";
      await admin
      .firestore()
      .doc('crimeStats/metadata')
      .get()
      .then((response) => {
        if(response.data()?.['stations']){
          for(let station of response.data()?.['stations']){
            if(station.toLowerCase().includes("" + foundStation.toLowerCase()
             || ("" + foundStation.toLowerCase()).includes(station.toLowerCase()))){
              correctStation = station.toLowerCase();
              break;
            }
          }
          if (correctStation === "") {
            console.log("Could not find station", foundStation);
          }
        }
      });

      let finalScore = 0;
      await admin
      .firestore()
      .doc('crimeStats/' + correctStation)
      .get()
      .then((response) => {
        finalScore = response.data()?.['score'];
      })

      return {type: "crime", status: true, percentage: finalScore};
    }
    catch(e : any){
      return {type: "crime", status: false, error: e ? e.message : "No error message available"};
    }
  }
}