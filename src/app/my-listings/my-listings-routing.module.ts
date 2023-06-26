import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyListingsPage } from './my-listings.page';

const routes: Routes = [
  {
    path: '',
    component: MyListingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyListingsPageRoutingModule {}
