import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ListingsService } from './listings.service';
import { CreateListingHandler } from './commands';
import { ListingsModule as ListingsDataAccessModule } from '@properproperty/api/listings/data-access';
const CommandHandlers = [CreateListingHandler];
@Module({
  imports: [
    CqrsModule, 
    ListingsDataAccessModule
  ],
  providers: [
    ListingsService,
    ...CommandHandlers
  ],
  exports: [ListingsService]
})
export class ListingsModule {}
