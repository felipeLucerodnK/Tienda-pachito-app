# users/serializers.py
from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model  = CustomUser
        fields = ['id', 'username', 'email', 'nombre', 'rol', 'foto', 'foto_url']
        extra_kwargs = {'foto': {'write_only': True}}

    def get_foto_url(self, obj):
        request = self.context.get('request')
        if obj.foto and request:
            return request.build_absolute_uri(obj.foto.url)
        return None