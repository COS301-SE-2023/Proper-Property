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
  // {
  //   path: 'profile',
  //   loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  // },
  // {
  //   path: 'search',
  //   loadChildren: () => import('./search/search.module').then( m => m.SearchPageModule)
  // },
  // {
  //   path: 'loading',
  //   loadChildren: () => import('./loading/loading.module').then( m => m.LoadingPageModule)
  // },
  // {
  //   path: 'listings',
  //   loadChildren: () => import('./listings/listings.module').then( m => m.ListingsPageModule)
  // },
  {
    path: 'copyright',
    loadChildren: () => import('@properproperty/app/copyright/feature').then( m => m.CopyrightPageModule)
  },
  // {
  //   path: 'version',
  //   loadChildren: () => import('./version/version.module').then( m => m.VersionPageModule)
  // },
  {
    path: 'create-listing',
    loadChildren: () => import('@properproperty/app/create-listing/feature').then( m => m.CreateListingPageModule)
  },
  // {
  //   path: 'settings',
  //   loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  // },
  {
    path: 'listing',
    loadChildren: () => import('@properproperty/app/listing/feature').then( m => m.ListingPageModule)
  },
  // {
  //   path: 'profile',
  //   loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  // },
  // {
  //   path: 'saved-listings',
  //   loadChildren: () => import('./saved-listings/saved-listings.module').then( m => m.SavedListingsPageModule)
  // },
  // {
  //   path: 'my-listings',
  //   loadChildren: () => import('./my-listings/my-listings.module').then( m => m.MyListingsPageModule)
  // }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  
})
export class CoreRouting {}
