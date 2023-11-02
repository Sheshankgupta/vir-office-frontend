import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./images/images.module').then( m => m.ImagesPageModule)
  },
  {
    path: 'collection',
    loadChildren: () => import('./collection/collection.module').then( m => m.CollectionPageModule)
  },
  {
    path: '**',
    pathMatch: 'full',
    component: PageNotFoundComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
