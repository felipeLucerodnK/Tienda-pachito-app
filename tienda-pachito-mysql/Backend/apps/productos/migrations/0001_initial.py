from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Producto',
            fields=[
                ('id',           models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre',       models.CharField(max_length=150)),
                ('precio',       models.DecimalField(decimal_places=2, max_digits=10)),
                ('stock',        models.PositiveIntegerField(default=0)),
                ('stock_minimo', models.PositiveIntegerField(default=10)),
                ('emoji',        models.CharField(default='📦', max_length=10)),
                ('creado_en',    models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'productos',
                'ordering': ['nombre'],
            },
        ),
    ]
