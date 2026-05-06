from django.urls import path, include

urlpatterns = [
    path('api/', include('apps.productos.urls')),
    path('api/', include('apps.ventas.urls')),
    path('api/', include('apps.compras.urls')),
    path('api/', include('apps.reportes.urls')),
]
