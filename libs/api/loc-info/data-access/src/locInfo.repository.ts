import { Injectable } from '@nestjs/common';
import { UploadDistrictDataResponse, UploadDistrictDataRequest, GetSaniDataRequest, GetSaniDataResponse } from '@properproperty/api/loc-info/util';
import { UploadCrimeStatsRequest,
  UploadCrimeStatsResponse,
  UploadSaniStatsRequest,
  UploadSaniStatsResponse } from '@properproperty/api/loc-info/util';
import * as admin from 'firebase-admin';

@Injectable()
export class LocInfoRepository {
  async uploadCrimeStats(req : UploadCrimeStatsRequest): Promise<UploadCrimeStatsResponse>{
    try{
      for(let station of req.stationStats){
        admin
        .firestore()
        .collection('crimeStats/')
        .doc(station.stationName)
        .set(station);
      }
    
      return {status: true};
    }
    catch{
      return {status: false};
    }
  }

  async uploadSaniStats(req : UploadSaniStatsRequest): Promise<UploadSaniStatsResponse>{
    try{
      for(let wsa of req.wsaSaniStats){
        admin
        .firestore()
        .collection('SaniStats/')
        .doc(wsa.WSA.toLowerCase())
        .set(wsa);
      }
    
      return {status: true};
    }
    catch(e){
      console.log(e)
      return {status: false};
    }
  }

  async uploadDistrictData(req : UploadDistrictDataRequest): Promise<UploadDistrictDataResponse>{
    try{
      for(let district of req.districts){
        admin
        .firestore()
        .collection('DistrictData/')
        .doc(district.name.toLowerCase())
        .set(district);
      }
    
      return {status: true};
    }
    catch(e){
      console.log(e)
      return {status: false};
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