import { District } from '../interfaces';

export interface UploadDistrictDataRequest{
  metadata: string[];
  districts: District[];
}