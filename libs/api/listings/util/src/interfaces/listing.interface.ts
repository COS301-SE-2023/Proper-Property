export interface Listing{
  listing_id?: string;
  user_id: string | undefined;
  address: string;
  price: string;
  pos_type: string;
  env_type: string;
  prop_type: string;
  furnish_type: string;
  orientation: string;
  floor_size: string;
  property_size: string;
  bath: string;
  bed: string;
  parking: string;
  features: string[];
  photos: string[];
  desc: string;
  let_sell: string;
  heading: string;
}