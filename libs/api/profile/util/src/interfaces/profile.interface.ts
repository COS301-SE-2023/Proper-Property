import { Interests } from "./interests.interface";

export interface UserProfile{
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  listings?: string[];
  interests: Interests;
  admin?: boolean;
  savedListings? : string[];
}