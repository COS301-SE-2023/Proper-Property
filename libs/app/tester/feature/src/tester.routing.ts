import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TesterPageComponent } from './tester.page';

const routes: Routes = [
  {
    path: '',
    component: TesterPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TesterPageRoutingModule {}
