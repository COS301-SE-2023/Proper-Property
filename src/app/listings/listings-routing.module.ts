import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListingsPage } from './listings.page';

const routes: Routes = [
  {
    path: '',
    component: ListingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListingsPageRoutingModule {}
