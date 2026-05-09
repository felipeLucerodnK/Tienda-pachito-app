export interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'empleado';
  foto_url: string | null;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}