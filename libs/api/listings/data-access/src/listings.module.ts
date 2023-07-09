import { Module } from '@nestjs/common';
import { ListingsRepository } from './listings.repository';
@Module({
  imports: [],
  controllers: [],
  providers: [ListingsRepository],
  exports: [ListingsRepository],
})
export class ListingsDataAccessModule {}