import { Injectable } from '@nestjs/common';
import { UserRecord } from 'firebase-admin/auth';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProfileCommand, GetUserProfileQuery, GetUserProfileResponse } from '@properproperty/api/profile/util';

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
}
