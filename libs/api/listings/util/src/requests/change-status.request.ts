import { StatusEnum } from "../enums";

export interface ChangeStatusRequest{
  status: StatusEnum;
  reason?: string;
  listingId: string;
  adminId?: string;
  crimeScore?: number;
  schoolScore?: number;
  waterScore?: number;
  sanitationScore?: number;
}