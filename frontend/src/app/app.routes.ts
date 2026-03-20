import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'empresas',
    loadComponent: () => import('./pages/empresas/empresas.component').then(m => m.EmpresasComponent),
    canActivate: [authGuard],
  },
  {
    path: 'empresas/:id',
    loadComponent: () => import('./pages/empresas/empresa-detalle/empresa-detalle.component').then(m => m.EmpresaDetalleComponent),
    canActivate: [authGuard],
  },
  {
    path: 'resenas',
    loadComponent: () => import('./pages/resenas/resenas.component').then(m => m.ResenasComponent),
    canActivate: [authGuard],
  },
  {
    path: 'cuenta',
    loadComponent: () => import('./pages/cuenta/cuenta.component').then(m => m.CuentaComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
