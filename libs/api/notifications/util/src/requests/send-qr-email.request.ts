import {UserProfile} from '@properproperty/api/profile/util';

export interface SendQREmailRequest{
  address: string;
  url: string;
  lister: UserProfile;
}