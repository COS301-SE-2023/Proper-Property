import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CopyrightPage } from './copyright.page';

const routes: Routes = [
  {
    path: '',
    component: CopyrightPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CopyrightPageRoutingModule {}
