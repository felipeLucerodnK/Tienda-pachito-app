from django.db import models
from apps.productos.models import Producto


class Compra(models.Model):
    producto        = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='compras')
    producto_nombre = models.CharField(max_length=150)
    cantidad        = models.PositiveIntegerField()
    costo_unitario  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total           = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fecha           = models.DateField()

    class Meta:
        db_table = 'compras'
        ordering = ['-fecha', '-id']

    def __str__(self):
        return f"Compra #{self.id} – {self.producto_nombre}"

    def to_dict(self):
        return {
            'id':              self.id,
            'producto_id':     self.producto_id,
            'producto_nombre': self.producto_nombre,
            'cantidad':        self.cantidad,
            'costo_unitario':  float(self.costo_unitario),
            'total':           float(self.total),
            'fecha':           str(self.fecha),
        }
