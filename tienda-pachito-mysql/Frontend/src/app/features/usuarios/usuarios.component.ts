import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'empleado';
  is_active: boolean;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  usuarios      = signal<Usuario[]>([]);
  cargando      = signal(true);
  mostrarModal  = signal(false);
  editando      = signal<Usuario | null>(null);
  errorMsg      = signal('');

  form: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      nombre:   ['', Validators.required],
      email:    ['', [Validators.email]],
      rol:      ['empleado', Validators.required],
      password: [''],
    });
  }

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.http.get<Usuario[]>(`${environment.apiUrl}/api/auth/usuarios/`).subscribe({
      next: data => { this.usuarios.set(data); this.cargando.set(false); },
      error: ()  => this.cargando.set(false)
    });
  }

  abrirCrear() {
    this.editando.set(null);
    this.form.reset({ rol: 'empleado' });
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.errorMsg.set('');
    this.mostrarModal.set(true);
  }

  abrirEditar(u: Usuario) {
    this.editando.set(u);
    this.form.patchValue(u);
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.errorMsg.set('');
    this.mostrarModal.set(true);
  }

  guardar() {
    if (this.form.invalid) return;
    const data = { ...this.form.value };
    if (!data.password) delete data.password;

    const req = this.editando()
      ? this.http.patch(`${environment.apiUrl}/api/auth/usuarios/${this.editando()!.id}/`, data)
      : this.http.post(`${environment.apiUrl}/api/auth/usuarios/`, data);

    req.subscribe({
      next: () => { this.mostrarModal.set(false); this.cargar(); },
      error: err => this.errorMsg.set(err.error?.detail || 'Error al guardar')
    });
  }

  toggleActivo(u: Usuario) {
    this.http.patch(`${environment.apiUrl}/api/auth/usuarios/${u.id}/`, { is_active: !u.is_active })
      .subscribe(() => this.cargar());
  }

  cerrarModal() { this.mostrarModal.set(false); }
}