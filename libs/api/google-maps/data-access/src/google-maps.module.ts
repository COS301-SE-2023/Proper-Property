import { Module } from '@nestjs/common';
import { GoogleMapsRepository } from './google-maps.repository'
import { ListingsModule as ListingsDataAccessModule} from '@properproperty/api/listings/data-access';
@Module({
  imports: [ListingsDataAccessModule],
  providers: [GoogleMapsRepository],
  exports: [GoogleMapsRepository],
})
export class GoogleMapsModule {}