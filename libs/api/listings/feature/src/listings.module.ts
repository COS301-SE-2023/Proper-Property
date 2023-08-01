import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ListingsService } from './listings.service';
import { CreateListingHandler, ChangeStatusHandler, EditListingHandler } from './commands';
import { ListingsModule as ListingsDataAccessModule } from '@properproperty/api/listings/data-access';
import { ListingEditedHandler } from './events';

const CommandHandlers = [CreateListingHandler, ChangeStatusHandler, EditListingHandler];
import { GetListingsHandler, GetApprovedListingsHandler } from './queries';
const QueryHandlers = [GetListingsHandler, GetApprovedListingsHandler];
const EventHandlers = [ListingEditedHandler];
@Module({
  imports: [
    CqrsModule, 
    ListingsDataAccessModule
  ],
  providers: [
    ListingsService,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers
  ],
  exports: [ListingsService]
})
export class ListingsModule {}
