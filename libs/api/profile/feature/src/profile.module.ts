import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileHandler } from './commands/create-profile.handler';
import { CqrsModule } from '@nestjs/cqrs';
const CommandHandlers = [CreateProfileHandler];
@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    ProfileService
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
