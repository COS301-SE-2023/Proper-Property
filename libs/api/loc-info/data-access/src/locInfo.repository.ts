import { Injectable } from '@nestjs/common';
import {  UploadLocInfoDataResponse,
  GetSaniDataRequest,
  GetSaniDataResponse,
  UploadCrimeStatsRequest, 
  UploadSaniStatsRequest,
  UploadDistrictDataRequest,
  UploadWWQStatsRequest} from '@properproperty/api/loc-info/util';
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