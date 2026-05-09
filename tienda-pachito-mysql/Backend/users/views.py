# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework import viewsets
from .models import CustomUser
from .serializers import UserSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Por favor ingresa usuario y contraseña'}, status=400)

        # Verificar si el usuario existe
        try:
            user_obj = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({'error': f'El usuario "{username}" no existe'}, status=401)

        # Verificar si está activo
        if not user_obj.is_active:
            return Response({'error': 'Este usuario está desactivado, contacta al administrador'}, status=403)

        # Verificar contraseña
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Contraseña incorrecta'}, status=401)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user':    UserSerializer(user, context={'request': request}).data
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all().order_by('-fecha_creacion')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        password = self.request.data.get('password')
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()

    def partial_update(self, request, *args, **kwargs):
        password = request.data.get('password')
        response = super().partial_update(request, *args, **kwargs)
        if password:
            user = self.get_object()
            user.set_password(password)
            user.save()
        return response