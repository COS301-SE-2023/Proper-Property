import { Injectable } from '@nestjs/common';
import { Station } from '@properproperty/api/loc-info/util';
import { UploadCrimeStatsRequest, UploadCrimeStatsResponse } from '@properproperty/api/loc-info/util';
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
}