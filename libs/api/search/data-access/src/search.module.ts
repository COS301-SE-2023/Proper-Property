import { Module } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [SearchRepository],
  exports: [SearchRepository],
})
export class SearchModule {}