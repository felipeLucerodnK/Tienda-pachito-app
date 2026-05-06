import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./features/productos/inventario.component').then(m => m.InventarioComponent)
      },
      {
        path: 'ventas',
        loadComponent: () => import('./features/ventas/ventas.component').then(m => m.VentasComponent)
      },
      {
        path: 'compras',
        loadComponent: () => import('./features/compras/compras.component').then(m => m.ComprasComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent)
      },
    ]
  },
  { path: '**', redirectTo: '' }
];
