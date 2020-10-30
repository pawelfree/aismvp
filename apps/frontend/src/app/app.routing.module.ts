import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InfoComponent } from './info/info.component';
import { KontomatikComponent } from './kontomatik/kontomatik.component';
import { ResultComponent } from './result/result.component';
import { DataGuard } from './data.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/info',
    pathMatch: 'full'
  },
  {
    path: 'result',
    canActivate: [DataGuard],
    component: ResultComponent
  },
  {
    path: 'kontomatik',
    component: KontomatikComponent
  },
  {
    path: 'info',
    component: InfoComponent
  },
  {
    path: '**',
    component: InfoComponent
  }
];

@NgModule( {
  imports: [RouterModule.forRoot( routes )],
  exports: [RouterModule]
} )
export class AppRoutingModule { }
