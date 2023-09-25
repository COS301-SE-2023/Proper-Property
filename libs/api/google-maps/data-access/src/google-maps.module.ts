import { Module } from '@nestjs/common';
import { GoogleMapsRepository } from './google-maps.repository'
import { ListingsModule as ListingsDataAccessModule} from '@properproperty/api/listings/data-access';
// import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ListingsDataAccessModule,
    // ConfigModule.forFeature()
  ],
  providers: [GoogleMapsRepository],
  exports: [GoogleMapsRepository],
})
export class GoogleMapsModule {}