export interface ChangeStatusRequest{
  listingId: string;
  adminId: string;
  crimeScore: number;
  schoolScore: number;
  waterScore: number;
  sanitationScore: number;
}