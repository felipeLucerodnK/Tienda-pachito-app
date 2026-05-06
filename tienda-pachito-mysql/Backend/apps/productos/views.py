from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import F
from .models import Producto


@api_view(['GET', 'POST'])
def productos_list(request):
    if request.method == 'GET':
        productos = Producto.objects.all()
        data = []
        for p in productos:
            d = p.to_dict()
            d['alerta_stock'] = p.stock <= p.stock_minimo
            data.append(d)
        return Response(data)

    # POST
    d = request.data
    if not d.get('nombre') or d.get('precio') is None:
        return Response({'error': 'nombre y precio son obligatorios'}, status=400)
    if float(d['precio']) <= 0:
        return Response({'error': 'El precio debe ser mayor a 0'}, status=400)

    p = Producto.objects.create(
        nombre       = str(d['nombre']).strip(),
        precio       = float(d['precio']),
        stock        = int(d.get('stock', 0)),
        stock_minimo = int(d.get('stock_minimo', 10)),
        emoji        = d.get('emoji', '📦'),
    )
    return Response(p.to_dict(), status=201)


@api_view(['GET', 'PUT', 'DELETE'])
def producto_detail(request, pk):
    try:
        p = Producto.objects.get(pk=pk)
    except Producto.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=404)

    if request.method == 'GET':
        d = p.to_dict()
        d['alerta_stock'] = p.stock <= p.stock_minimo
        return Response(d)

    if request.method == 'PUT':
        d = request.data
        if 'nombre' in d:
            p.nombre = str(d['nombre']).strip()
        if 'precio' in d:
            if float(d['precio']) <= 0:
                return Response({'error': 'El precio debe ser mayor a 0'}, status=400)
            p.precio = float(d['precio'])
        if 'stock_minimo' in d:
            p.stock_minimo = int(d['stock_minimo'])
        if 'emoji' in d:
            p.emoji = d['emoji']
        if 'stock' in d:
            p.stock = int(d['stock'])
        p.save()
        return Response(p.to_dict())

    if request.method == 'DELETE':
        try:
            p.delete()
            return Response(status=204)
        except Exception:
            return Response(
                {'error': 'No se puede eliminar este producto porque tiene ventas o compras registradas.'},
                status=400
            )


@api_view(['GET'])
def alertas_stock(request):
    alertas = Producto.objects.filter(stock__lte=F('stock_minimo'))
    return Response([p.to_dict() for p in alertas])
