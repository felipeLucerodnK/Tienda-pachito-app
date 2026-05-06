from django.db import models
from apps.productos.models import Producto


class Venta(models.Model):
    producto         = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='ventas')
    producto_nombre  = models.CharField(max_length=150)   # denormalizado para histórico
    cantidad         = models.PositiveIntegerField()
    precio_unitario  = models.DecimalField(max_digits=10, decimal_places=2)
    total            = models.DecimalField(max_digits=12, decimal_places=2)
    fecha            = models.DateField()

    class Meta:
        db_table = 'ventas'
        ordering = ['-fecha', '-id']

    def __str__(self):
        return f"Venta #{self.id} – {self.producto_nombre}"

    def to_dict(self):
        return {
            'id':              self.id,
            'producto_id':     self.producto_id,
            'producto_nombre': self.producto_nombre,
            'cantidad':        self.cantidad,
            'precio_unitario': float(self.precio_unitario),
            'total':           float(self.total),
            'fecha':           str(self.fecha),
        }
