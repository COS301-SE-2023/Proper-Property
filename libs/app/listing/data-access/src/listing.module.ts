import { NgModule } from "@angular/core";

import { ListingsService } from "./listing.service";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [ListingsService]
})
export class ListingModule {}