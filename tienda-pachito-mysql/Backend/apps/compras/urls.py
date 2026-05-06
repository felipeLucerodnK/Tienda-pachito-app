from django.urls import path
from . import views

urlpatterns = [
    path('compras/', views.compras_list),
]
