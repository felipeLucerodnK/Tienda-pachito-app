from django.urls import path
from . import views

urlpatterns = [
    path('reportes/diario/', views.reporte_diario),
    path('reportes/rango/', views.reporte_rango),
]
