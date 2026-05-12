import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SoundService } from '../../core/services/sound.service';
import { Producto, Venta } from '../../core/models/models';
import { CopPipe } from '../../shared/pipes/cop.pipe';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, CopPipe],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit {
  productos = signal<Producto[]>([]);
  ventasHoy = signal<Venta[]>([]);
  productoSeleccionado = signal<Producto | null>(null);
  cantidad = signal(1);
  procesando = signal(false);

  total = computed(() => {
    const p = this.productoSeleccionado();
    return p ? p.precio * this.cantidad() : 0;
  });

  hoy = new Date().toLocaleDateString('en-CA');

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private sound: SoundService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarVentasHoy();
  }

  cargarProductos() {
    this.api.getProductos().subscribe(p => this.productos.set(p));
  }

  cargarVentasHoy() {
    this.api.getVentas(this.hoy).subscribe(v => this.ventasHoy.set(v.slice().reverse()));
  }

  seleccionar(p: Producto) {
    this.sound.click();
    this.productoSeleccionado.set(p);
    this.cantidad.set(1);
  }

  setCantidad(val: number) {
    this.cantidad.set(Math.max(1, val));
  }

  registrarVenta() {
    const p = this.productoSeleccionado();
    if (!p) { this.sound.error(); this.toast.mostrar('Selecciona un producto', 'error'); return; }
    if (this.cantidad() <= 0) { this.sound.error(); this.toast.mostrar('La cantidad debe ser mayor a 0', 'error'); return; }

    this.procesando.set(true);
    this.api.crearVenta({ producto_id: p.id, cantidad: this.cantidad() }).subscribe({
      next: (v) => {
        this.sound.cajaRegistradora();
        this.toast.mostrar(`Venta registrada: ${v.producto_nombre} x${v.cantidad}`);
        this.productoSeleccionado.set(null);
        this.cantidad.set(1);
        this.cargarProductos();
        this.cargarVentasHoy();
        this.procesando.set(false);
      },
      error: (err) => {
        this.sound.error();
        const msg = err?.error?.error || 'Error al registrar la venta';
        this.toast.mostrar(msg, 'error');
        this.procesando.set(false);
      }
    });
  }
}