import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'plants/add',
    loadComponent: () => import('./features/plant-form/plant-form.component').then(m => m.PlantFormComponent)
  },
  {
    path: 'plants/:id',
    loadComponent: () => import('./features/plant-detail/plant-detail.component').then(m => m.PlantDetailComponent)
  },
  {
    path: 'plants/:id/edit',
    loadComponent: () => import('./features/plant-form/plant-form.component').then(m => m.PlantFormComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
