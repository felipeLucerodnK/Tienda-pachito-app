from django.urls import path
from . import views

urlpatterns = [
    path('ventas/', views.ventas_list),
    path('ventas/multiple/', views.ventas_multiple),
]