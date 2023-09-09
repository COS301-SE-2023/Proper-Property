import { ApprovalChange } from "../interfaces";

export interface ChangeStatusResponse{
  success: boolean,
  approvalChange: ApprovalChange | undefined
}