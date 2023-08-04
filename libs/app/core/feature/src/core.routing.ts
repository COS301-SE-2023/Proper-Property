import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('@properproperty/app/home/feature').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('@properproperty/app/login/feature').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('@properproperty/app/register/feature').then( m => m.RegisterPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('@properproperty/app/profile/feature').then( m => m.ProfilePageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('@properproperty/app/search/feature').then( m => m.SearchPageModule)
  },
  {
    path: 'loading',
    loadChildren: () => import('@properproperty/app/loading/feature').then( m => m.LoadingPageModule)
  },
  {
    path: 'copyright',
    loadChildren: () => import('@properproperty/app/copyright/feature').then( m => m.CopyrightPageModule)
  },
  {
    path: 'version',
    loadChildren: () => import('@properproperty/app/version/feature').then( m => m.VersionPageModule)
  },
  {
    path: 'create-listing',
    loadChildren: () => import('@properproperty/app/create-listing/feature').then( m => m.CreateListingPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('@properproperty/app/settings/feature').then( m => m.SettingsPageModule)
  },
  {
    path: 'listing',
    loadChildren: () => import('@properproperty/app/listing/feature').then( m => m.ListingPageModule)
  },
  {
    path: 'saved-listings',
    loadChildren: () => import('@properproperty/app/saved-listings/feature').then( m => m.SavedListingsPageModule)
  },
  {
    path: 'my-listings',
    loadChildren: () => import('@properproperty/app/my-listings/feature').then( m => m.MyListingsPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('@properproperty/app/admin/feature').then( m => m.AdminPageModule)
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  
})
export class CoreRouting {}
