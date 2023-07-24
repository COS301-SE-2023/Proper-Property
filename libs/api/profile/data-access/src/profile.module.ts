import { Module } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
@Module({
  providers: [ProfileRepository],
  exports: [ProfileRepository],
})
export class ProfileModule {}