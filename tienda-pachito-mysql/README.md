# 🛒 Tienda Pachito — Con MySQL Workbench

> **Stack:** Python 3.11 + Django 4.2 · Angular 19 · MySQL 8 · Windows · VS Code

---

## 📁 Estructura del Proyecto

```
tienda-pachito/
├── Backend/
│   ├── tienda_pachito/
│   │   ├── settings.py          # ← Configura tus credenciales MySQL aquí
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── productos/           # Modelo + Views ORM (PB-01, PB-03, PB-06)
│   │   ├── ventas/              # Modelo + Views ORM (PB-02)
│   │   ├── compras/             # Modelo + Views ORM (PB-04)
│   │   └── reportes/            # Views ORM (PB-05)
│   ├── sql/
│   │   ├── 01_crear_base_datos.sql   # Ejecutar en MySQL Workbench primero
│   │   └── 02_datos_iniciales.sql    # Ejecutar después de migrate
│   ├── manage.py
│   └── requirements.txt
└── Frontend/  (sin cambios)
```

---

## 🗄️ PASO 1 — Crear la base de datos en MySQL Workbench

1. Abre **MySQL Workbench** y conéctate a tu servidor local
2. Abre el archivo `Backend/sql/01_crear_base_datos.sql`
3. Ejecuta el script (⚡ o Ctrl+Shift+Enter)
4. Deberías ver: `Base de datos tienda_pachito creada correctamente ✅`

---

## ⚙️ PASO 2 — Configurar credenciales en settings.py

Abre `Backend/tienda_pachito/settings.py` y edita esta sección:

```python
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.mysql',
        'NAME':     'tienda_pachito',   # nombre de la BD (no cambiar)
        'USER':     'root',              # ← tu usuario MySQL
        'PASSWORD': '1234',              # ← tu contraseña MySQL
        'HOST':     'localhost',
        'PORT':     '3306',
    }
}
```

---

## 🐍 PASO 3 — Configurar el Backend (Django)

```bash
# Navegar a la carpeta Backend
cd tienda-pachito\Backend

# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate

# Instalar dependencias (incluye mysqlclient)
pip install -r requirements.txt

# Crear las tablas en MySQL
python manage.py migrate

# Levantar el servidor
python manage.py runserver
```

> ✅ El backend estará en: **http://localhost:8000**

### Verificar que conectó bien:
Abre en el navegador: http://localhost:8000/api/productos/
- Si ves `[]` → conexión exitosa (sin datos aún)
- Si ves error → revisa usuario/contraseña en settings.py

---

## 📦 PASO 4 — Cargar datos iniciales (opcional)

Una vez que el servidor corra correctamente, ejecuta en MySQL Workbench:

`Backend/sql/02_datos_iniciales.sql`

Esto carga 6 productos, ventas y compras de ejemplo.

---

## 🅰️ PASO 5 — Configurar el Frontend (Angular)

```bash
# Segunda terminal
cd tienda-pachito\Frontend

# Instalar dependencias
npm install

# Levantar Angular
npm start
```

> ✅ El frontend estará en: **http://localhost:4200**

---

## 🔧 Solución de Problemas

### ❌ `django.db.utils.OperationalError: (1045) Access denied`
→ Usuario o contraseña incorrectos en `settings.py`

### ❌ `django.db.utils.OperationalError: (2003) Can't connect to MySQL`
→ MySQL no está corriendo. Inicia el servicio MySQL desde Windows Services o MySQL Workbench

### ❌ `ModuleNotFoundError: No module named 'MySQLdb'`
→ Ejecuta: `pip install mysqlclient`

### ❌ `mysqlclient` falla al instalar en Windows
→ Instala primero: [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
→ O usa el wheel precompilado: `pip install mysqlclient --find-links https://www.lfd.uci.edu/~gohlke/pythonlibs/`

---

## 📋 Backlog completado

| Historia | Descripción | Estado |
|----------|-------------|--------|
| PB-01 | Registro de Productos | ✅ |
| PB-02 | Registro de Ventas | ✅ |
| PB-03 | Actualización de Stock (MySQL) | ✅ |
| PB-04 | Registro de Compras | ✅ |
| PB-05 | Reporte Diario | ✅ |
| PB-06 | Alerta de Stock Bajo | ✅ |
