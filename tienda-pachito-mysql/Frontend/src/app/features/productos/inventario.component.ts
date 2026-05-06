import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Producto } from '../../core/models/models';
import { CopPipe } from '../../shared/pipes/cop.pipe';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, CopPipe],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {
  productos = signal<Producto[]>([]);
  mostrarModal = signal(false);
  modoEdicion = signal(false);
  cargando = signal(false);

  emojis = ['🍞','🥛','🍎','🌾','🫙','🥚','🧃','🧈','🍗','🥩','🐟','🍅','🥕','🧄','🧅','☕','🍫','🧂','📦','🛒'];

  form = {
    id: 0,
    nombre: '',
    precio: 0,
    stock: 0,
    stock_minimo: 10,
    emoji: '📦'
  };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.api.getProductos().subscribe({
      next: p => { this.productos.set(p); this.cargando.set(false); },
      error: (err) => {
        const msg = err?.error?.error || err?.message || 'Error al cargar productos';
        this.toast.mostrar(msg, 'error');
        this.cargando.set(false);
      }
    });
  }

  abrirNuevo() {
    this.form = { id: 0, nombre: '', precio: 0, stock: 0, stock_minimo: 10, emoji: '📦' };
    this.modoEdicion.set(false);
    this.mostrarModal.set(true);
  }

  abrirEdicion(p: Producto) {
    this.form = { ...p };
    this.modoEdicion.set(true);
    this.mostrarModal.set(true);
  }

  cerrarModal() { this.mostrarModal.set(false); }

  guardar() {
    if (!this.form.nombre || this.form.precio <= 0) {
      this.toast.mostrar('Nombre y precio son obligatorios', 'error');
      return;
    }
    if (this.modoEdicion()) {
      this.api.actualizarProducto(this.form.id, this.form).subscribe({
        next: () => { this.toast.mostrar('Producto actualizado ✓'); this.cerrarModal(); this.cargar(); },
        error: (err) => {
          const msg = err?.error?.error || err?.message || 'Error al actualizar';
          this.toast.mostrar(msg, 'error');
        }
      });
    } else {
      // Enviar sin emoji para evitar problemas de charset en MySQL
      const payload: any = {
        nombre:       this.form.nombre,
        precio:       this.form.precio,
        stock:        this.form.stock,
        stock_minimo: this.form.stock_minimo,
        emoji:        this.form.emoji,
      };
      this.api.crearProducto(payload).subscribe({
        next: () => { this.toast.mostrar('Producto agregado ✓'); this.cerrarModal(); this.cargar(); },
        error: (err) => {
          const msg = err?.error?.error || err?.message || 'Error al crear producto';
          this.toast.mostrar(msg, 'error');
          console.error('Error detallado:', err);
        }
      });
    }
  }

  eliminar(p: Producto) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    this.api.eliminarProducto(p.id).subscribe({
      next: () => { this.toast.mostrar('Producto eliminado', 'alerta'); this.cargar(); },
      error: (err) => {
        const msg = err?.error?.error || 'Error al eliminar';
        this.toast.mostrar(msg, 'error');
      }
    });
  }

  stockClass(p: Producto): string {
    if (p.stock === 0) return 'stock--empty';
    if (p.stock <= p.stock_minimo) return 'stock--low';
    return 'stock--ok';
  }
}
