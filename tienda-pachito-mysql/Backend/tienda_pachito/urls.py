from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/', include('apps.productos.urls')),
    path('api/', include('apps.ventas.urls')),
    path('api/', include('apps.compras.urls')),
    path('api/', include('apps.reportes.urls')),
    path('api/auth/', include('users.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)