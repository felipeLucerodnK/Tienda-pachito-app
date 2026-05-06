from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Count
from datetime import date
from collections import defaultdict
from apps.ventas.models import Venta


@api_view(['GET'])
def reporte_diario(request):
    fecha = request.query_params.get('fecha', date.today().isoformat())

    ventas = Venta.objects.filter(fecha=fecha)
    ventas_list = [v.to_dict() for v in ventas]

    totales = ventas.aggregate(
        total_ingresos=Sum('total'),
        total_transacciones=Count('id'),
        total_unidades=Sum('cantidad'),
    )

    # Agrupar por producto
    productos_vendidos = defaultdict(lambda: {'cantidad': 0, 'total': 0.0})
    for v in ventas_list:
        productos_vendidos[v['producto_nombre']]['cantidad'] += v['cantidad']
        productos_vendidos[v['producto_nombre']]['total'] += v['total']

    resumen_productos = [
        {'producto': nombre, **datos}
        for nombre, datos in productos_vendidos.items()
    ]

    return Response({
        'fecha':                   fecha,
        'total_ingresos':          float(totales['total_ingresos'] or 0),
        'total_transacciones':     totales['total_transacciones'] or 0,
        'total_unidades_vendidas': totales['total_unidades'] or 0,
        'detalle_ventas':          ventas_list,
        'resumen_por_producto':    resumen_productos,
    })


@api_view(['GET'])
def reporte_rango(request):
    fecha_inicio = request.query_params.get('fecha_inicio', date.today().isoformat())
    fecha_fin    = request.query_params.get('fecha_fin',    date.today().isoformat())

    ventas = Venta.objects.filter(fecha__gte=fecha_inicio, fecha__lte=fecha_fin)
    ventas_list = [v.to_dict() for v in ventas]

    totales = ventas.aggregate(
        total_ingresos=Sum('total'),
        total_transacciones=Count('id'),
    )

    # Agrupar por día
    por_dia = defaultdict(lambda: {'ingresos': 0.0, 'transacciones': 0})
    for v in ventas_list:
        por_dia[v['fecha']]['ingresos']       += v['total']
        por_dia[v['fecha']]['transacciones']  += 1

    return Response({
        'fecha_inicio':        fecha_inicio,
        'fecha_fin':           fecha_fin,
        'total_ingresos':      float(totales['total_ingresos'] or 0),
        'total_transacciones': totales['total_transacciones'] or 0,
        'por_dia': [
            {'fecha': f, **datos}
            for f, datos in sorted(por_dia.items())
        ],
    })
