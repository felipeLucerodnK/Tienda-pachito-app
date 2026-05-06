import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  tipo: 'exito' | 'error' | 'alerta';
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 1;

  mostrar(mensaje: string, tipo: Toast['tipo'] = 'exito') {
    const toast: Toast = { id: this.nextId++, tipo, mensaje };
    this.toasts.update(t => [...t, toast]);
    setTimeout(() => this.remover(toast.id), 3500);
  }

  remover(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
