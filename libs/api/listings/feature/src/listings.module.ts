import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ListingsService } from './listings.service';
import { ListingsModule as ListingsDataAccessModule } from '@properproperty/api/listings/data-access';

import { 
  CreateListingHandler, 
  ChangeStatusHandler, 
  EditListingHandler,
  SaveListingHandler,
} from './commands';
const CommandHandlers = [
  CreateListingHandler, 
  ChangeStatusHandler, 
  EditListingHandler,
  SaveListingHandler
];

import { 
  GetListingsHandler, 
  GetApprovedListingsHandler,
  GetUnapprovedListingsHandler,
  GetFilteredListingsHandler
} from './queries';
const QueryHandlers = [
  GetListingsHandler, 
  GetApprovedListingsHandler,
  GetUnapprovedListingsHandler,
  GetFilteredListingsHandler
];

import { 
  ListingEditedHandler, 
  StatusChangedHandler,
  ListingCreatedHandler
} from './events';

const EventHandlers = [
  ListingEditedHandler, 
  StatusChangedHandler,
  ListingCreatedHandler
];
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
