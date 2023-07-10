import { Injectable } from '@nestjs/common';
import { UserRecord } from 'firebase-admin/auth';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  CreateProfileCommand, 
  GetUserProfileQuery, 
  GetUserProfileResponse, 
  UpdateUserProfileCommand, 
  UpdateUserProfileResponse, 
  UserProfile, 
  AddListingCommand 
} from '@properproperty/api/profile/util';

@Injectable()
export class ProfileService {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  createProfile(user: UserRecord) {
    // console.log(user);
    return this.commandBus.execute(new CreateProfileCommand(user));
  }

  getUserProfile(userId: string): Promise<GetUserProfileResponse> {
    // console.log(user);
    return this.queryBus.execute(new GetUserProfileQuery(userId));
  }

  updateUserProfile(user: UserProfile): Promise<UpdateUserProfileResponse> {
    console.log("User profile service");
    console.log(user);
    return this.commandBus.execute(new UpdateUserProfileCommand(user));
  }
  addListing(userId: string, listingId: string): Promise<UpdateUserProfileResponse> {
    return this.commandBus.execute(new AddListingCommand(userId, listingId));
  }
}
