import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CopPipe } from '../../shared/pipes/cop.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CopPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalHoy = signal(0);
  ventasHoy = signal(0);
  productosActivos = signal(0);
  alertas = signal(0);
  ventasRecientes = signal<any[]>([]);
  productosAlerta = signal<any[]>([]);
  hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getReporteDiario(this.hoy).subscribe(r => {
      this.totalHoy.set(r.total_ingresos);
      this.ventasHoy.set(r.total_transacciones);
      this.ventasRecientes.set(r.detalle_ventas.slice(-5).reverse());
    });
    this.api.getProductos().subscribe(p => {
      this.productosActivos.set(p.length);
    });
    this.api.getAlertasStock().subscribe(a => {
      this.alertas.set(a.length);
      this.productosAlerta.set(a);
    });
  }
}