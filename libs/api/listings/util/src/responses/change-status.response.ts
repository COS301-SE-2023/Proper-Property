import { ApprovalChange } from "../interfaces";

export interface ChangeStatusResponse{
  success: boolean,
  ApprovalChange: ApprovalChange | undefined
}