import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Venta } from '../../core/models/models';
import { CopPipe } from '../../shared/pipes/cop.pipe';

@Component({
  selector: 'app-recibo',
  standalone: true,
  imports: [CommonModule, CopPipe],
  template: `
    <div class="recibo-backdrop" (click)="cerrar.emit()">
      <div class="recibo-modal" (click)="$event.stopPropagation()">

        <div class="recibo-acciones no-print">
          <button class="btn-imprimir" (click)="imprimir()">🖨️ Imprimir</button>
          <button class="btn-cerrar" (click)="cerrar.emit()">× Cerrar</button>
        </div>

        <div class="recibo" id="recibo-contenido">
          <div class="recibo-header">
            <div class="recibo-logo">🏪</div>
            <h2>Tienda Pachito</h2>
            <p class="recibo-sub">Sistema de Gestión</p>
            <div class="recibo-divider">--------------------------------</div>
          </div>

          <div class="recibo-info">
            <div class="recibo-fila">
              <span>Fecha:</span>
              <span>{{ ventas[0]?.fecha }}</span>
            </div>
            <div class="recibo-fila">
              <span>Cajero:</span>
              <span>{{ cajero }}</span>
            </div>
            <div class="recibo-fila">
              <span>No. Venta:</span>
              <span>#{{ ventas[0]?.id }}</span>
            </div>
          </div>

          <div class="recibo-divider">--------------------------------</div>

          <div class="recibo-items">
            <div class="recibo-items-header">
              <span>Producto</span>
              <span>Cant.</span>
              <span>Total</span>
            </div>
            <div class="recibo-divider">--------------------------------</div>
            @for (v of ventas; track v.id) {
              <div class="recibo-item">
                <span class="item-nombre">{{ v.producto_nombre }}</span>
                <span class="item-cant">x{{ v.cantidad }}</span>
                <span class="item-total">{{ v.total | cop }}</span>
              </div>
              <div class="item-precio-unit">
                {{ v.precio_unitario | cop }} c/u
              </div>
            }
          </div>

          <div class="recibo-divider">--------------------------------</div>

          <div class="recibo-totales">
            <div class="recibo-fila">
              <span>Subtotal:</span>
              <span>{{ subtotal() | cop }}</span>
            </div>
            <div class="recibo-fila recibo-total-final">
              <span>TOTAL:</span>
              <span>{{ subtotal() | cop }}</span>
            </div>
          </div>

          <div class="recibo-divider">--------------------------------</div>

          <div class="recibo-footer">
            <p>¡Gracias por su compra!</p>
            <p>Vuelva pronto!</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .recibo-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000;
    }
    .recibo-modal {
      background: white; border-radius: 12px;
      padding: 1.5rem; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .recibo-acciones {
      display: flex; gap: 0.75rem; margin-bottom: 1rem; justify-content: flex-end;
    }
    .btn-imprimir {
      background: #0f3460; color: white; border: none;
      padding: 0.5rem 1rem; border-radius: 8px;
      cursor: pointer; font-weight: 600;
      &:hover { background: #16213e; }
    }
    .btn-cerrar {
      background: #f3f4f6; color: #374151; border: none;
      padding: 0.5rem 1rem; border-radius: 8px;
      cursor: pointer; font-weight: 600;
      &:hover { background: #e5e7eb; }
    }
    .recibo {
      font-family: 'Courier New', monospace;
      width: 280px; margin: 0 auto;
      font-size: 0.85rem; color: #111;
    }
    .recibo-header { text-align: center; margin-bottom: 0.5rem; }
    .recibo-logo { font-size: 2rem; }
    .recibo-header h2 { margin: 0.25rem 0; font-size: 1.1rem; }
    .recibo-sub { color: #6b7280; margin: 0; font-size: 0.75rem; }
    .recibo-divider { color: #9ca3af; margin: 0.5rem 0; font-size: 0.75rem; }
    .recibo-info { margin: 0.5rem 0; }
    .recibo-fila {
      display: flex; justify-content: space-between;
      margin-bottom: 0.25rem;
    }
    .recibo-items-header {
      display: flex; justify-content: space-between;
      font-weight: 700; font-size: 0.8rem;
    }
    .recibo-item {
      display: flex; justify-content: space-between;
      margin-top: 0.4rem;
    }
    .item-nombre { flex: 1; }
    .item-cant { width: 35px; text-align: center; }
    .item-total { width: 80px; text-align: right; }
    .item-precio-unit { color: #6b7280; font-size: 0.75rem; margin-bottom: 0.25rem; }
    .recibo-totales { margin: 0.5rem 0; }
    .recibo-total-final { font-weight: 900; font-size: 1rem; margin-top: 0.25rem; }
    .recibo-footer { text-align: center; margin-top: 0.5rem; color: #6b7280; font-size: 0.8rem; }

    @media print {
      .no-print { display: none !important; }

      body > * { visibility: hidden; }

      app-recibo,
      app-recibo * { visibility: visible; }

      .recibo-backdrop {
        position: fixed !important;
        inset: 0 !important;
        background: none !important;
        display: flex !important;
        align-items: flex-start !important;
        justify-content: center !important;
      }

      .recibo-modal {
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
        max-height: none !important;
        overflow: visible !important;
      }

      .recibo {
        width: 280px !important;
      }
    }
  `]
})
export class ReciboComponent {
  @Input() ventas: Venta[] = [];
  @Input() cajero: string = '';
  @Output() cerrar = new EventEmitter<void>();

  subtotal() {
    return this.ventas.reduce((acc, v) => acc + v.total, 0);
  }

  imprimir() {
    window.print();
  }
}