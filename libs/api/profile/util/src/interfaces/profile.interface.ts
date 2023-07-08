import { Interests } from "./interests.interface";

export interface profile{
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  listings?: string[];
  interests: Interests; 
}