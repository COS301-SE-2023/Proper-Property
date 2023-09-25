export interface SearchListingsRequest {
  query?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  parking?: number;
  listingType?: string;
}