export interface GetLocInfoDataRequest {
  type: string;
  district?: string;
  listingAreaType?: string;
  listingType?: string;
  latlong?: {
    lat: number,
    long: number
  }
}