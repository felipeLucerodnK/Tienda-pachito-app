import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SoundService } from '../../core/services/sound.service';
import { AuthService } from '../../core/services/auth.service';
import { Producto, Venta } from '../../core/models/models';
import { CopPipe } from '../../shared/pipes/cop.pipe';
import { ReciboComponent } from './recibo.component';

interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, CopPipe, ReciboComponent],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit {
  productos     = signal<Producto[]>([]);
  ventasHoy     = signal<Venta[]>([]);
  carrito       = signal<CarritoItem[]>([]);
  procesando    = signal(false);
  reciboVentas  = signal<Venta[]>([]);
  mostrarRecibo = signal(false);

  totalCarrito = computed(() =>
    this.carrito().reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)
  );

  gruposVentasHoy = computed(() => {
    const ventas = this.ventasHoy();
    const grupos = new Map<string, Venta[]>();

    ventas.forEach(v => {
      const key = v.grupo_venta || `solo_${v.id}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(v);
    });

    return Array.from(grupos.values());
  });

  hoy = new Date().toLocaleDateString('en-CA');

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private sound: SoundService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarVentasHoy();
  }

  cargarProductos() {
    this.api.getProductos().subscribe(p => this.productos.set(p));
  }

  cargarVentasHoy() {
    this.api.getVentas(this.hoy).subscribe(v =>
      this.ventasHoy.set([...v].sort((a, b) => b.id - a.id))
    );
  }

  agregarAlCarrito(p: Producto) {
    const actual = this.carrito();
    const idx = actual.findIndex(i => i.producto.id === p.id);
    if (idx >= 0) {
      const nueva = [...actual];
      if (nueva[idx].cantidad < p.stock) {
        nueva[idx] = { ...nueva[idx], cantidad: nueva[idx].cantidad + 1 };
        this.carrito.set(nueva);
      } else {
        this.toast.mostrar(`Stock máximo: ${p.stock} u.`, 'alerta');
        return;
      }
    } else {
      this.carrito.set([...actual, { producto: p, cantidad: 1 }]);
    }
    this.sound.click();
  }

  incrementar(productoId: number) {
    const actual = [...this.carrito()];
    const idx = actual.findIndex(i => i.producto.id === productoId);
    if (idx >= 0 && actual[idx].cantidad < actual[idx].producto.stock) {
      actual[idx] = { ...actual[idx], cantidad: actual[idx].cantidad + 1 };
      this.carrito.set(actual);
      this.sound.click();
    }
  }

  decrementar(productoId: number) {
    const actual = [...this.carrito()];
    const idx = actual.findIndex(i => i.producto.id === productoId);
    if (idx >= 0) {
      if (actual[idx].cantidad > 1) {
        actual[idx] = { ...actual[idx], cantidad: actual[idx].cantidad - 1 };
        this.carrito.set(actual);
      } else {
        this.quitarDelCarrito(productoId);
      }
      this.sound.click();
    }
  }

  quitarDelCarrito(productoId: number) {
    this.carrito.set(this.carrito().filter(i => i.producto.id !== productoId));
    this.sound.error();
  }

  estaEnCarrito(productoId: number): boolean {
    return this.carrito().some(i => i.producto.id === productoId);
  }

  getCantidadEnCarrito(productoId: number): number {
    return this.carrito().find(i => i.producto.id === productoId)?.cantidad || 0;
  }

  verRecibo(ventas: Venta[]) {
    this.reciboVentas.set(ventas);
    this.mostrarRecibo.set(true);
  }

  cerrarRecibo() {
    this.mostrarRecibo.set(false);
    this.reciboVentas.set([]);
  }

  registrarVenta() {
    if (this.carrito().length === 0) {
      this.sound.error();
      this.toast.mostrar('El carrito está vacío', 'error');
      return;
    }

    this.procesando.set(true);
    const items = this.carrito().map(i => ({
      producto_id: i.producto.id,
      cantidad:    i.cantidad
    }));

    this.api.crearVentaMultiple({ items }).subscribe({
      next: () => {
        this.sound.cajaRegistradora();
        this.toast.mostrar(`Venta registrada: ${this.carrito().length} producto(s)`);
        this.carrito.set([]);
        this.cargarProductos();
        this.cargarVentasHoy();
        this.procesando.set(false);
      },
      error: (err) => {
        this.sound.error();
        this.toast.mostrar(err?.error?.error || 'Error al registrar la venta', 'error');
        this.procesando.set(false);
      }
    });
  }
}