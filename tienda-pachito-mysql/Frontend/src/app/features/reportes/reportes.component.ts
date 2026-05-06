import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ReporteDiario } from '../../core/models/models';
import { CopPipe } from '../../shared/pipes/cop.pipe';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, CopPipe],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
  reporte = signal<ReporteDiario | null>(null);
  fechaSeleccionada = new Date().toLocaleDateString('en-CA');
  cargando = signal(false);

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.api.getReporteDiario(this.fechaSeleccionada).subscribe({
      next: r => { this.reporte.set(r); this.cargando.set(false); },
      error: () => { this.toast.mostrar('Error al cargar reporte', 'error'); this.cargando.set(false); }
    });
  }

  porcentaje(total: number, grand: number): number {
    if (!grand) return 0;
    return Math.round((total / grand) * 100);
  }
}
