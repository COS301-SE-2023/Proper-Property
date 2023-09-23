import {StatusEnum } from '../enums'
export interface StatusChange {
  adminId?: string;
  status: StatusEnum;
  date: string;
}