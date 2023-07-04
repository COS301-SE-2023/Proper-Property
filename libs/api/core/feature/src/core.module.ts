import { Module } from '@nestjs/common';
import { ProfileModule } from '@properproperty/api/profile/feature';
@Module({
  imports: [ProfileModule],
})
export class CoreModule {}