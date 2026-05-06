"""
Almacén de datos en memoria para el prototipo de Tienda Pachito.
Simula una base de datos sin necesidad de configurar una real.
"""
from datetime import datetime, date
import threading

_lock = threading.Lock()

# ─── PRODUCTOS ───────────────────────────────────────────────────────────────
_productos = [
    {"id": 1, "nombre": "Pan Artesanal",  "precio": 3500,  "stock": 120, "stock_minimo": 30, "emoji": "🍞"},
    {"id": 2, "nombre": "Leche Entera",   "precio": 4200,  "stock": 20,  "stock_minimo": 25, "emoji": "🥛"},
    {"id": 3, "nombre": "Manzanas (kg)",  "precio": 6000,  "stock": 50,  "stock_minimo": 15, "emoji": "🍎"},
    {"id": 4, "nombre": "Arroz 1kg",      "precio": 4500,  "stock": 110, "stock_minimo": 20, "emoji": "🌾"},
    {"id": 5, "nombre": "Aceite 1L",      "precio": 12000, "stock": 80,  "stock_minimo": 10, "emoji": "🫙"},
    {"id": 6, "nombre": "Huevos x12",     "precio": 9500,  "stock": 60,  "stock_minimo": 12, "emoji": "🥚"},
]
_next_producto_id = 7

# ─── VENTAS ──────────────────────────────────────────────────────────────────
_ventas = [
    {"id": 1, "producto_id": 1, "producto_nombre": "Pan Artesanal",  "cantidad": 5,  "precio_unitario": 3500,  "total": 17500,  "fecha": "2025-04-14"},
    {"id": 2, "producto_id": 3, "producto_nombre": "Manzanas (kg)",  "cantidad": 2,  "precio_unitario": 6000,  "total": 12000,  "fecha": "2025-04-14"},
    {"id": 3, "producto_id": 5, "producto_nombre": "Aceite 1L",      "cantidad": 1,  "precio_unitario": 12000, "total": 12000,  "fecha": "2025-04-15"},
    {"id": 4, "producto_id": 6, "producto_nombre": "Huevos x12",     "cantidad": 3,  "precio_unitario": 9500,  "total": 28500,  "fecha": "2025-04-15"},
    {"id": 5, "producto_id": 2, "producto_nombre": "Leche Entera",   "cantidad": 4,  "precio_unitario": 4200,  "total": 16800,  "fecha": "2025-04-16"},
    {"id": 6, "producto_id": 4, "producto_nombre": "Arroz 1kg",      "cantidad": 10, "precio_unitario": 4500,  "total": 45000,  "fecha": "2025-04-16"},
]
_next_venta_id = 7

# ─── COMPRAS ─────────────────────────────────────────────────────────────────
_compras = [
    {"id": 1, "producto_id": 2, "producto_nombre": "Leche Entera",  "cantidad": 50, "costo_unitario": 3200, "total": 160000, "fecha": "2025-04-10"},
    {"id": 2, "producto_id": 4, "producto_nombre": "Arroz 1kg",     "cantidad": 80, "costo_unitario": 3500, "total": 280000, "fecha": "2025-04-12"},
]
_next_compra_id = 3


def get_productos():
    with _lock:
        return [p.copy() for p in _productos]

def get_producto(pid):
    with _lock:
        return next((p.copy() for p in _productos if p["id"] == pid), None)

def add_producto(data):
    global _next_producto_id
    with _lock:
        nuevo = {
            "id": _next_producto_id,
            "nombre": data["nombre"],
            "precio": data["precio"],
            "stock": data.get("stock", 0),
            "stock_minimo": data.get("stock_minimo", 10),
            "emoji": data.get("emoji", "📦"),
        }
        _productos.append(nuevo)
        _next_producto_id += 1
        return nuevo.copy()

def update_producto(pid, data):
    with _lock:
        for p in _productos:
            if p["id"] == pid:
                if "nombre" in data: p["nombre"] = data["nombre"]
                if "precio" in data: p["precio"] = data["precio"]
                if "stock_minimo" in data: p["stock_minimo"] = data["stock_minimo"]
                if "emoji" in data: p["emoji"] = data["emoji"]
                return p.copy()
        return None

def delete_producto(pid):
    with _lock:
        global _productos
        before = len(_productos)
        _productos = [p for p in _productos if p["id"] != pid]
        return len(_productos) < before

def descontar_stock(pid, cantidad):
    with _lock:
        for p in _productos:
            if p["id"] == pid:
                if p["stock"] < cantidad:
                    return False, p["stock"]
                p["stock"] -= cantidad
                return True, p["stock"]
        return False, 0

def sumar_stock(pid, cantidad):
    with _lock:
        for p in _productos:
            if p["id"] == pid:
                p["stock"] += cantidad
                return True, p["stock"]
        return False, 0


def get_ventas(fecha=None):
    with _lock:
        ventas = [v.copy() for v in _ventas]
    if fecha:
        ventas = [v for v in ventas if v["fecha"] == fecha]
    return ventas

def add_venta(data):
    global _next_venta_id
    producto = get_producto(data["producto_id"])
    if not producto:
        return None, "Producto no encontrado"
    ok, stock_actual = descontar_stock(data["producto_id"], data["cantidad"])
    if not ok:
        return None, f"Stock insuficiente. Disponible: {stock_actual}"
    with _lock:
        nueva = {
            "id": _next_venta_id,
            "producto_id": data["producto_id"],
            "producto_nombre": producto["nombre"],
            "cantidad": data["cantidad"],
            "precio_unitario": producto["precio"],
            "total": producto["precio"] * data["cantidad"],
            "fecha": date.today().isoformat(),
        }
        _ventas.append(nueva)
        _next_venta_id += 1
        return nueva.copy(), None


def get_compras():
    with _lock:
        return [c.copy() for c in _compras]

def add_compra(data):
    global _next_compra_id
    producto = get_producto(data["producto_id"])
    if not producto:
        return None, "Producto no encontrado"
    sumar_stock(data["producto_id"], data["cantidad"])
    with _lock:
        nueva = {
            "id": _next_compra_id,
            "producto_id": data["producto_id"],
            "producto_nombre": producto["nombre"],
            "cantidad": data["cantidad"],
            "costo_unitario": data.get("costo_unitario", 0),
            "total": data.get("costo_unitario", 0) * data["cantidad"],
            "fecha": date.today().isoformat(),
        }
        _compras.append(nueva)
        _next_compra_id += 1
        return nueva.copy(), None


def get_alertas_stock():
    with _lock:
        return [p.copy() for p in _productos if p["stock"] <= p["stock_minimo"]]
