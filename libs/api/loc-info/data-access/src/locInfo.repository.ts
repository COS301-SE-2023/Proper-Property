import { Injectable } from '@nestjs/common';
import {  UploadLocInfoDataResponse,
  GetSaniDataRequest,
  GetSaniDataResponse,
  UploadCrimeStatsRequest, 
  UploadSaniStatsRequest,
  UploadDistrictDataRequest,
  UploadWWQStatsRequest,
  UploadWaterAccessDataRequest,
  UploadWaterQualityDataRequest,
  UploadWaterReliabilityDataRequest,
  UploadWaterTariffDataRequest} from '@properproperty/api/loc-info/util';
import * as admin from 'firebase-admin';

@Injectable()
export class LocInfoRepository {
  async uploadCrimeStats(req : UploadCrimeStatsRequest): Promise<UploadLocInfoDataResponse>{
    try{
      for(let station of req.stationStats){
        admin
        .firestore()
        .collection('crimeStats/')
        .doc(station.stationName)
        .set(station);
      }
    
      return {type: "crime", status: true};
    }
    catch(e : any){
      return {type: "crime", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadSaniStats(req : UploadSaniStatsRequest): Promise<UploadLocInfoDataResponse>{
    try{
      for(let wsa of req.wsaSaniStats){
        admin
        .firestore()
        .collection('SaniStats-Sanitation')
        .doc(wsa.WSA.toLowerCase())
        .set(wsa);
      }
    
      return {type: "sanitation", status: true};
    }
    catch(e : any){
      return {type: "crime", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadWWQStats(req : UploadWWQStatsRequest): Promise<UploadLocInfoDataResponse>{
    try{
      for(let wsa of req.wsaWWQStats){
        admin
        .firestore()
        .collection('SaniStats-WWQ')
        .doc(wsa.WSA.toLowerCase())
        .set(wsa);
      }
    
      return {type: "wwq", status: true};
    }
    catch(e : any){
      return {type: "crime", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadDistrictData(req : UploadDistrictDataRequest): Promise<UploadLocInfoDataResponse>{
    try{
      console.log(req.districts)
      for(let district of req.districts){
        admin
        .firestore()
        .collection('DistrictData/')
        .doc(district.name.toLowerCase())
        .set(district);
      }
    
      return {type: "district", status: true};
    }
    catch(e : any){
      return {type: "crime", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadWaterAccessStats(req : UploadWaterAccessDataRequest): Promise<UploadLocInfoDataResponse>{
    try{
      for(let wsa of req.wsaData){
        admin
        .firestore()
        .collection('WaterStats-Access/')
        .doc(wsa.wsa.toLowerCase())
        .set(wsa);
      }
    
      return {type: "waterAccess", status: true};
    }
    catch(e : any){
      return {type: "waterAccess", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadWaterQualityStats(req : UploadWaterQualityDataRequest): Promise<UploadLocInfoDataResponse>{
    try{
      for(let wsa of req.wsaData){
        admin
        .firestore()
        .collection('WaterStats-Quality/')
        .doc(wsa.wsa.toLowerCase())
        .set(wsa);
      }
    
      return {type: "waterQuality", status: true};
    }
    catch(e : any){
      return {type: "waterQuality", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadWaterReliabilityStats(req : UploadWaterReliabilityDataRequest): Promise<UploadLocInfoDataResponse>{
    try{
      for(let wsa of req.wsaData){
        admin
        .firestore()
        .collection('WaterStats-Reliability/')
        .doc(wsa.wsa.toLowerCase())
        .set(wsa);
      }
    
      return {type: "waterReliability", status: true};
    }
    catch(e : any){
      return {type: "waterReliability", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async uploadWaterTariffStats(req : UploadWaterTariffDataRequest): Promise<UploadLocInfoDataResponse>{
    try{
      for(let wma of req.wmaData){
        admin
        .firestore()
        .collection('WaterStats-Tariffs/')  
        .doc(wma.wma.toLowerCase())
        .set(wma);
      }
    
      return {type: "waterTariff", status: true};
    }
    catch(e : any){
      return {type: "waterTariff", status: false, error: e ? e.message : "No error message available"};
    }
  }

  async getSaniData(req: GetSaniDataRequest): Promise<GetSaniDataResponse>{
    try{      
      console.log("Municipality", req.municipality);
      let result = await admin.
      firestore().
      doc('SaniStats/' + req.municipality.toLowerCase()).
      get().
      then((response) => {
          console.log(response.data());
          console.log(response.data()?.['percentageBasicSani']);
          return {status: true, percentage: response.data()?.['percentageBasicSani']};
        });  

      return result;
    }
    catch(e){
      console.log(e)
      return {status: false, percentage: "102%"};
    }
  }
}