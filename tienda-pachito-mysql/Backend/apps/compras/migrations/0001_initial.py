from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('productos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Compra',
            fields=[
                ('id',              models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('producto',        models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='compras', to='productos.producto')),
                ('producto_nombre', models.CharField(max_length=150)),
                ('cantidad',        models.PositiveIntegerField()),
                ('costo_unitario',  models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('total',           models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('fecha',           models.DateField()),
            ],
            options={'db_table': 'compras', 'ordering': ['-fecha', '-id']},
        ),
    ]
