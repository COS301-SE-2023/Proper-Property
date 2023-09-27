import { StatusChange } from "../interfaces";

export interface ChangeStatusResponse{
  success: boolean,
  statusChange: StatusChange | undefined,
  message?: string
}