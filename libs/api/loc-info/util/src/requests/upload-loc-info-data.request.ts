import { UploadDistrictDataRequest,
   UploadCrimeStatsRequest, 
   UploadSaniStatsRequest, 
   UploadWWQStatsRequest, 
   UploadWaterTariffDataRequest, 
   UploadWaterAccessDataRequest, 
   UploadWaterReliabilityDataRequest, 
   UploadWaterQualityDataRequest } from '../requests';

export interface UploadLocInfoDataRequest{
  request: UploadDistrictDataRequest |
   UploadCrimeStatsRequest |
   UploadSaniStatsRequest |
   UploadWWQStatsRequest |
   UploadWaterReliabilityDataRequest |
   UploadWaterTariffDataRequest |
   UploadWaterAccessDataRequest |
   UploadWaterQualityDataRequest;
  path: string;
}