import { UploadDistrictDataRequest, UploadCrimeStatsRequest, UploadSaniStatsRequest, UploadWWQStatsRequest } from '../requests';

export interface UploadLocInfoDataRequest{
  request: UploadDistrictDataRequest | UploadCrimeStatsRequest | UploadSaniStatsRequest | UploadWWQStatsRequest;
  path: string;
}