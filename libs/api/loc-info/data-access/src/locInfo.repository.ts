import { Injectable } from '@nestjs/common';
import { Station } from '@properproperty/api/loc-info/util';
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
        .collection('locationInfo/crimeStats/' + station.stationName)
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
        .collection('locationInfo/SaniStats/' + wsa.WSA)
        .doc(wsa.WSA)
        .create(wsa);
        // .set(wsa);
      }
    
      return {status: true};
    }
    catch(e){
      console.log(e)
      return {status: false};
    }
  }
}