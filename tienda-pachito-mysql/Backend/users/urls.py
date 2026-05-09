# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, MeView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, MeView, UsuarioViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    path('login/',   LoginView.as_view(),        name='login'),
    path('refresh/', TokenRefreshView.as_view(),  name='token_refresh'),
    path('me/',      MeView.as_view(),            name='me'),
    path('',         include(router.urls)),
]