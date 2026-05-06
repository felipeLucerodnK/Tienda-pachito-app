from django.urls import path
from . import views

urlpatterns = [
    path('productos/', views.productos_list),
    path('productos/<int:pk>/', views.producto_detail),
    path('alertas/stock/', views.alertas_stock),
]
