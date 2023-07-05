import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileModule as ProfileDataAccessModule } from '@properproperty/api/profile/data-access';
import { CqrsModule } from '@nestjs/cqrs';

import { CreateProfileHandler } from './commands';
const CommandHandlers = [CreateProfileHandler];

import { ProfileCreatedHandler } from './events';
const EventHandlers = [ProfileCreatedHandler];

import { GetUserProfileHandler } from './queries';
const QueryHandlers = [GetUserProfileHandler];

@Module({
  imports: [ProfileDataAccessModule, CqrsModule],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
    ProfileService
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
