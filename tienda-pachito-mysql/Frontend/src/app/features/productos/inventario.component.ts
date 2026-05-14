import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SoundService } from '../../core/services/sound.service';
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
  busqueda = signal('');


  productosFiltrados = computed(() =>
    this.productos().filter(p =>
      p.nombre.toLowerCase().includes(this.busqueda().toLowerCase()) ||
      p.id.toString().includes(this.busqueda())
    )
  );

  emojis = ['🍞','🥛','🍎','🌾','🫙','🥚','🧃','🧈','🍗','🥩','🐟','🍅','🥕','🧄','🧅','☕','🍫','🧂','📦','🛒'];

  form = {
    id: 0,
    nombre: '',
    precio: 0,
    stock: 0,
    stock_minimo: 10,
    emoji: '📦'
  };

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private sound: SoundService
  ) {}

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
    this.sound.click();
    this.form = { id: 0, nombre: '', precio: 0, stock: 0, stock_minimo: 10, emoji: '📦' };
    this.modoEdicion.set(false);
    this.mostrarModal.set(true);
  }

  abrirEdicion(p: Producto) {
    this.sound.click();
    this.form = { ...p };
    this.modoEdicion.set(true);
    this.mostrarModal.set(true);
  }

  cerrarModal() { this.mostrarModal.set(false); }

  guardar() {
    if (!this.form.nombre || this.form.precio <= 0) {
      this.sound.error();
      this.toast.mostrar('Nombre y precio son obligatorios', 'error');
      return;
    }
    if (this.modoEdicion()) {
      this.api.actualizarProducto(this.form.id, this.form).subscribe({
        next: () => {
          this.sound.exito();
          this.toast.mostrar('Producto actualizado ✓');
          this.cerrarModal();
          this.cargar();
        },
        error: (err) => {
          this.sound.error();
          const msg = err?.error?.error || err?.message || 'Error al actualizar';
          this.toast.mostrar(msg, 'error');
        }
      });
    } else {
      const payload: any = {
        nombre:       this.form.nombre,
        precio:       this.form.precio,
        stock:        this.form.stock,
        stock_minimo: this.form.stock_minimo,
        emoji:        this.form.emoji,
      };
      this.api.crearProducto(payload).subscribe({
        next: () => {
          this.sound.exito();
          this.toast.mostrar('Producto agregado ✓');
          this.cerrarModal();
          this.cargar();
        },
        error: (err) => {
          this.sound.error();
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
      next: () => {
        this.sound.error();
        this.toast.mostrar('Producto eliminado', 'alerta');
        this.cargar();
      },
      error: (err) => {
        this.sound.error();
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