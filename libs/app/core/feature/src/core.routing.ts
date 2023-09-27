import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, PreloadAllModules, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { UserProfileState } from '@properproperty/app/profile/data-access';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
export const profileCompletionGuard = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
) => {
  const profile = inject(Store).selectSnapshot(UserProfileState.userProfile);
  if (window.location.hostname.includes('localhost')) {
    console.log(route);
    console.log(state);
    console.log(profile);
  }
  if (profile && (!profile.firstName || !profile.lastName || !profile.phoneNumber || !profile.email)) {

    inject(Router).navigate(['/profile']);
    return false;
  } 
  // if (!profile 
  //   && (state.url.includes('/create-listing')
  //     || state.url.includes('/profile')
  //     || state.url.includes('/my-listings')
  //     || state.url.includes('/saved-listings')
  //   )
  // ) {
  //   inject(Router).navigate(['/login']);
  //   return false;
  // }
  return true;
}
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    canActivate: [profileCompletionGuard],
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
    canActivate: [profileCompletionGuard],
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
    path: 'terms-of-use',
    loadChildren: () => import('@properproperty/app/terms-of-use/feature').then( m => m.TermsOfUsePageModule)
  },

  {
    path: 'version',
    loadChildren: () => import('@properproperty/app/version/feature').then( m => m.VersionPageModule)
  },
  {
    path: 'create-listing',
    canActivate: [profileCompletionGuard],
    loadChildren: () => import('@properproperty/app/create-listing/feature').then( m => m.CreateListingPageModule)
  },
  // {
  //   path: 'settings',
  //   loadChildren: () => import('@properproperty/app/settings/feature').then( m => m.SettingsPageModule)
  // },
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
