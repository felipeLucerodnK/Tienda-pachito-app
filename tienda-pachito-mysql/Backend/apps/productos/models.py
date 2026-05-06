from django.db import models


class Producto(models.Model):
    nombre       = models.CharField(max_length=150)
    precio       = models.DecimalField(max_digits=10, decimal_places=2)
    stock        = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=10)
    emoji        = models.CharField(max_length=10, default='📦')
    creado_en    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'productos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

    def to_dict(self):
        return {
            'id':           self.id,
            'nombre':       self.nombre,
            'precio':       float(self.precio),
            'stock':        self.stock,
            'stock_minimo': self.stock_minimo,
            'emoji':        self.emoji,
        }
