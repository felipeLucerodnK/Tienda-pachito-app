import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, Venta, Compra, ReporteDiario, ReporteRango } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'https://tienda-pachito-app-production-63e3.up.railway.app/api';

  constructor(private http: HttpClient) {}

  // ── PRODUCTOS ──────────────────────────────────────────────────────────────
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.base}/productos/`);
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.base}/productos/${id}/`);
  }

  crearProducto(data: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(`${this.base}/productos/`, data);
  }

  actualizarProducto(id: number, data: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.base}/productos/${id}/`, data);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/productos/${id}/`);
  }

  getAlertasStock(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.base}/alertas/stock/`);
  }

  // ── VENTAS ─────────────────────────────────────────────────────────────────
  getVentas(fecha?: string): Observable<Venta[]> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<Venta[]>(`${this.base}/ventas/`, { params });
  }

  crearVenta(data: { producto_id: number; cantidad: number }): Observable<Venta> {
    return this.http.post<Venta>(`${this.base}/ventas/`, data);
  }

  crearVentaMultiple(data: { items: { producto_id: number; cantidad: number }[] }): Observable<Venta[]> {
    return this.http.post<Venta[]>(`${this.base}/ventas/multiple/`, data);
  }

  // ── COMPRAS ────────────────────────────────────────────────────────────────
  getCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(`${this.base}/compras/`);
  }

  crearCompra(data: { producto_id: number; cantidad: number; costo_unitario: number }): Observable<Compra> {
    return this.http.post<Compra>(`${this.base}/compras/`, data);
  }

  // ── REPORTES ───────────────────────────────────────────────────────────────
  getReporteDiario(fecha?: string): Observable<ReporteDiario> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<ReporteDiario>(`${this.base}/reportes/diario/`, { params });
  }

  getReporteRango(fechaInicio: string, fechaFin: string): Observable<ReporteRango> {
    const params = new HttpParams()
      .set('fecha_inicio', fechaInicio)
      .set('fecha_fin', fechaFin);
    return this.http.get<ReporteRango>(`${this.base}/reportes/rango/`, { params });
  }
}