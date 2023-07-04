import { Injectable } from '@nestjs/common';
import { UserRecord } from 'firebase-admin/auth';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProfileCommand } from '@properproperty/api/profile/util';

@Injectable()
export class ProfileService {
  constructor(private readonly commandBus: CommandBus) {}

  createProfile(user: UserRecord) {
    console.log(user);
    return this.commandBus.execute(new CreateProfileCommand(user));
  }
}
