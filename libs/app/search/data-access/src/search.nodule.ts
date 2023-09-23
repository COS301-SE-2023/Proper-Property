import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from './search.service';

@NgModule({
  imports: [CommonModule],
  providers: [SearchService],
})
export class SearchModule {}