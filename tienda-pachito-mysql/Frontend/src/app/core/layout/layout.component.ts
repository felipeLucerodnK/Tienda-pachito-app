import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { Producto } from '../models/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  alertasCount = signal(0);
  alertas      = signal<Producto[]>([]);
  mostrarAlertas = signal(false);

  get navItems() {
  const items = [
    { path: '/dashboard',  label: 'Dashboard',   icon: 'home'      },
    { path: '/inventario', label: 'Inventario',  icon: 'inventory' },
    { path: '/ventas',     label: 'Nueva Venta', icon: 'cart'      },
    { path: '/reportes',   label: 'Reportes',    icon: 'chart'     },
    { path: '/compras',    label: 'Compras',     icon: 'truck'     },
  ];

  if (this.auth.isAdmin()) {
    items.push({ path: '/usuarios', label: 'Usuarios', icon: 'users' });
  }

  return items;
}

  constructor(
    public toast: ToastService,
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit() { this.cargarAlertas(); }

  cargarAlertas() {
    this.api.getAlertasStock().subscribe(a => {
      this.alertas.set(a);
      this.alertasCount.set(a.length);
    });
  }

  toggleAlertas() {
    this.mostrarAlertas.update(v => !v);
    if (this.mostrarAlertas()) this.cargarAlertas();
  }

  cerrarAlertas() { this.mostrarAlertas.set(false); }

  logout() { this.auth.logout(); }
}