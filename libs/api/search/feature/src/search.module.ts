import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SearchService } from './search.service';
import { SearchModule as SearchDataAccessModule } from '@properproperty/api/search/data-access';
import { SearchListingsHandler } from './queries/search-listings.handler';

const QueryHandlers = [SearchListingsHandler];
@Module({
  imports: [
    CqrsModule, 
    SearchDataAccessModule
  ],
  providers: [
    SearchService,
    ...QueryHandlers,
  ],
  exports: [SearchService],
})
export class SearchModule {}
