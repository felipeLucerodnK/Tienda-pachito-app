from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
from datetime import date
from apps.productos.models import Producto
from .models import Venta


@api_view(['GET', 'POST'])
def ventas_list(request):
    if request.method == 'GET':
        fecha = request.query_params.get('fecha', None)
        qs = Venta.objects.all()
        if fecha:
            qs = qs.filter(fecha=fecha)
        return Response([v.to_dict() for v in qs])

    # POST
    d = request.data
    producto_id = d.get('producto_id')
    cantidad    = d.get('cantidad')

    if not producto_id or not cantidad:
        return Response({'error': 'producto_id y cantidad son obligatorios'}, status=400)

    try:
        cantidad = int(cantidad)
    except (ValueError, TypeError):
        return Response({'error': 'cantidad debe ser un número'}, status=400)

    if cantidad <= 0:
        return Response({'error': 'La cantidad debe ser mayor a 0'}, status=400)

    try:
        with transaction.atomic():
            p = Producto.objects.select_for_update().get(pk=int(producto_id))

            if p.stock < cantidad:
                return Response(
                    {'error': f'Stock insuficiente. Disponible: {p.stock}'},
                    status=400
                )

            p.stock -= cantidad
            p.save(update_fields=['stock'])

            venta = Venta.objects.create(
                producto        = p,
                producto_nombre = p.nombre,
                cantidad        = cantidad,
                precio_unitario = p.precio,
                total           = p.precio * cantidad,
                fecha           = date.today(),
            )
            return Response(venta.to_dict(), status=201)

    except Producto.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)