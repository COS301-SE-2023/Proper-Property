import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VersionPage } from './version.page';

const routes: Routes = [
  {
    path: '',
    component: VersionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VersionPageRoutingModule {}
