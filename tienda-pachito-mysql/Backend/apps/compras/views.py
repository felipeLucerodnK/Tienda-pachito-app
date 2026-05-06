from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
from datetime import date
from apps.productos.models import Producto
from .models import Compra


@api_view(['GET', 'POST'])
def compras_list(request):
    if request.method == 'GET':
        return Response([c.to_dict() for c in Compra.objects.all()])

    # POST – registrar compra
    d = request.data
    if not d.get('producto_id') or not d.get('cantidad'):
        return Response({'error': 'producto_id y cantidad son obligatorios'}, status=400)

    cantidad = int(d['cantidad'])
    if cantidad <= 0:
        return Response({'error': 'La cantidad debe ser mayor a 0'}, status=400)

    costo_unitario = float(d.get('costo_unitario', 0))

    try:
        with transaction.atomic():
            p = Producto.objects.select_for_update().get(pk=int(d['producto_id']))

            p.stock += cantidad
            p.save(update_fields=['stock'])

            compra = Compra.objects.create(
                producto        = p,
                producto_nombre = p.nombre,
                cantidad        = cantidad,
                costo_unitario  = costo_unitario,
                total           = costo_unitario * cantidad,
                fecha           = date.today(),
            )
            return Response(compra.to_dict(), status=201)

    except Producto.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=404)
