import { StatusEnum } from "../enums";

export interface ChangeStatusRequest{
  listingId: string;
  adminId?: string;
  status: StatusEnum;
  crimeScore?: number;
  schoolScore?: number;
  waterScore?: number;
  sanitationScore?: number;
}