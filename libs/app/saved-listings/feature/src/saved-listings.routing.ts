import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SavedListingsPage } from './saved-listings.page';

const routes: Routes = [
  {
    path: '',
    component: SavedListingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SavedListingsPageRoutingModule {}
