export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  emoji: string;
  alerta_stock?: boolean;
}

export interface Venta {
  id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  fecha: string;
  grupo_venta?: string;
}

export interface Compra {
  id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  costo_unitario: number;
  total: number;
  fecha: string;
}

export interface ReporteDiario {
  fecha: string;
  total_ingresos: number;
  total_transacciones: number;
  total_unidades_vendidas: number;
  detalle_ventas: Venta[];
  detalle_agrupado: {
    grupo_venta: string;
    fecha: string;
    productos: Venta[];
    total: number;
  }[];
  resumen_por_producto: { producto: string; cantidad: number; total: number }[];
}

export interface ReporteRango {
  fecha_inicio: string;
  fecha_fin: string;
  total_ingresos: number;
  total_transacciones: number;
  por_dia: { fecha: string; ingresos: number; transacciones: number }[];
}
