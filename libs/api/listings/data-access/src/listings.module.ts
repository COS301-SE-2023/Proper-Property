import { Module } from '@nestjs/common';
import { ListingsRepository } from './listings.repository';
@Module({
  providers: [ListingsRepository],
  exports: [ListingsRepository],
})
export class ListingsModule {}