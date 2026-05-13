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

    # POST — venta individual
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


@api_view(['POST'])
def ventas_multiple(request):
    """Registra una venta con múltiples productos de una sola vez."""
    items = request.data.get('items', [])

    if not items or len(items) == 0:
        return Response({'error': 'El carrito está vacío'}, status=400)

    try:
        with transaction.atomic():
            ventas_creadas = []

            for item in items:
                producto_id = item.get('producto_id')
                cantidad    = item.get('cantidad')

                if not producto_id or not cantidad:
                    raise ValueError('Cada item debe tener producto_id y cantidad')

                cantidad = int(cantidad)
                if cantidad <= 0:
                    raise ValueError('La cantidad debe ser mayor a 0')

                p = Producto.objects.select_for_update().get(pk=int(producto_id))

                if p.stock < cantidad:
                    raise ValueError(f'Stock insuficiente para "{p.nombre}". Disponible: {p.stock}')

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
                ventas_creadas.append(venta.to_dict())

            return Response(ventas_creadas, status=201)

    except Producto.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=404)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)