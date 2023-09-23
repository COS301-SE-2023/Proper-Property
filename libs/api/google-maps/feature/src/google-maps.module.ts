import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GoogleMapsService } from './google-maps.service';
import { GoogleMapsModule as GoogleMapsDataAccessModule } from '@properproperty/api/google-maps/data-access';
import { GoogleMapsSagas } from './google-maps.sagas';

import { 
  AddPOIHandler
} from './commands';
const CommandHandlers = [
  AddPOIHandler
];

import { 
  GetNearbyPlacesHandler, 
} from './queries';
const QueryHandlers = [
  GetNearbyPlacesHandler
];

@Module({
  imports: [
    CqrsModule, 
    GoogleMapsDataAccessModule
  ],
  providers: [
    GoogleMapsService,
    GoogleMapsSagas,
    ...CommandHandlers,
    ...QueryHandlers
  ],
  exports: [GoogleMapsService]
})
export class GoogleMapsModule {}
