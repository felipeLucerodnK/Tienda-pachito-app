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
        total_unidades=Sum('cantidad'),
    )

    # Contar transacciones por grupo_venta
    grupos = set(v['grupo_venta'] for v in ventas_list if v.get('grupo_venta'))
    ventas_sin_grupo = sum(1 for v in ventas_list if not v.get('grupo_venta'))
    total_transacciones = len(grupos) + ventas_sin_grupo

    # Agrupar por producto
    productos_vendidos = defaultdict(lambda: {'cantidad': 0, 'total': 0.0})
    for v in ventas_list:
        productos_vendidos[v['producto_nombre']]['cantidad'] += v['cantidad']
        productos_vendidos[v['producto_nombre']]['total']    += v['total']

    resumen_productos = [
        {'producto': nombre, **datos}
        for nombre, datos in productos_vendidos.items()
    ]

    # Agrupar detalle por grupo_venta
    grupos_dict = defaultdict(list)
    for v in ventas_list:
        key = v.get('grupo_venta') or f"solo_{v['id']}"
        grupos_dict[key].append(v)

    detalle_agrupado = [
        {
            'grupo_venta': key,
            'fecha': items[0]['fecha'],
            'productos': items,
            'total': sum(i['total'] for i in items),
        }
        for key, items in grupos_dict.items()
    ]

    return Response({
        'fecha':                   fecha,
        'total_ingresos':          float(totales['total_ingresos'] or 0),
        'total_transacciones':     total_transacciones,
        'total_unidades_vendidas': totales['total_unidades'] or 0,
        'detalle_ventas':          ventas_list,
        'detalle_agrupado':        detalle_agrupado,
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
    )

    # Contar transacciones por grupo_venta por día
    por_dia = defaultdict(lambda: {'ingresos': 0.0, 'grupos': set(), 'sin_grupo': 0})
    for v in ventas_list:
        fecha = v['fecha']
        por_dia[fecha]['ingresos'] += v['total']
        if v.get('grupo_venta'):
            por_dia[fecha]['grupos'].add(v['grupo_venta'])
        else:
            por_dia[fecha]['sin_grupo'] += 1

    return Response({
        'fecha_inicio':        fecha_inicio,
        'fecha_fin':           fecha_fin,
        'total_ingresos':      float(totales['total_ingresos'] or 0),
        'total_transacciones': len(set(v.get('grupo_venta') or f"solo_{v['id']}" for v in ventas_list)),
        'por_dia': [
            {
                'fecha': f,
                'ingresos': datos['ingresos'],
                'transacciones': len(datos['grupos']) + datos['sin_grupo']
            }
            for f, datos in sorted(por_dia.items())
        ],
    })