import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SoundService } from '../../core/services/sound.service';
import { Producto, Compra } from '../../core/models/models';
import { CopPipe } from '../../shared/pipes/cop.pipe';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, CopPipe],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.scss']
})
export class ComprasComponent implements OnInit {
  productos  = signal<Producto[]>([]);
  historial  = signal<Compra[]>([]);
  procesando = signal(false);

  productoId    = signal(0);
  cantidad      = signal(1);
  costoUnitario = signal(0);

  productoSeleccionado = computed(() =>
    this.productos().find(p => p.id === this.productoId()) || null
  );

  totalCompra = computed(() =>
    this.cantidad() * this.costoUnitario()
  );

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private sound: SoundService
  ) {}

  ngOnInit() {
    this.api.getProductos().subscribe(p => this.productos.set(p));
    this.api.getCompras().subscribe(c => this.historial.set(c.slice().reverse()));
  }

  registrar() {
    if (!this.productoId() || this.cantidad() <= 0) {
      this.sound.error();
      this.toast.mostrar('Selecciona producto y cantidad', 'error');
      return;
    }
    this.procesando.set(true);
    this.api.crearCompra({
      producto_id:    this.productoId(),
      cantidad:       this.cantidad(),
      costo_unitario: this.costoUnitario()
    }).subscribe({
      next: () => {
        this.sound.compra();
        this.toast.mostrar('Compra registrada. Stock actualizado.');
        this.productoId.set(0);
        this.cantidad.set(1);
        this.costoUnitario.set(0);
        this.api.getCompras().subscribe(c => this.historial.set(c.slice().reverse()));
        this.api.getProductos().subscribe(p => this.productos.set(p));
        this.procesando.set(false);
      },
      error: (err) => {
        this.sound.error();
        this.toast.mostrar(err?.error?.error || 'Error al registrar compra', 'error');
        this.procesando.set(false);
      }
    });
  }
}