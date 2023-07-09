import { UserProfile } from '@properproperty/api/profile/util';

export interface GetUserProfileResponse {
  user: UserProfile | null;
}