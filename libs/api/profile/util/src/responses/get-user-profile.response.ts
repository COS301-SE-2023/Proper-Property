import { profile } from '@properproperty/api/profile/util';

export interface GetUserProfileResponse {
  user: profile | null;
}